import moment from 'moment';
import 'moment-timezone';
import { isObject } from '../../../lib/Utility';
import { v4 } from 'uuid';
import EstimateBanner from '../EstimateBanner';
import {
  Match,
  MatchData,
  MatchStop,
  MatchStopData,
  ServiceLevel,
  VehicleClass,
} from '../../../lib/actions/MatchAction';
import { useAppDispatch, useAppSelector } from '../../../lib/store';
import {
  createEstimate,
  selectEstimate,
  selectEstimateBoxTruckAgreement,
  updateEstimate,
} from '../../../lib/reducers/estimateSlice';
import StopsRepeater from '../StopsRepeater';
import MatchScheduler, {
  matchScheduleSchema,
  ScheduleValues,
} from '../MatchScheduler';
import { Form, Formik, yupToFormErrors } from 'formik';
import { VehicleClassSelect } from '../VehicleClassSelect';
import * as yup from 'yup';
import { SchemaOf } from 'yup';
import { useSelector } from 'react-redux';
import { ShipTabProps } from '../../../screens/ShipScreen';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrevious } from '../../../lib/Hooks';
import {
  buildCargoStopItemValues,
  cargoSchema,
  cargoStopItemSchema,
  cargoStopSchema,
  CargoStopValues,
  CargoValues,
} from './Cargo';
import StepFooter from '../StepFooter';
import EstimateFormOnChange from '../EstimateFormOnChange';
import { FormikChangeHelpers } from '../../form/FormikOnChange';
import ContractSelect from '../ContractSelect';
import { MatchCsvUploader } from '../MatchCsvUploader';
import { fetchFeatureFlag, selectUser } from '../../../lib/reducers/userSlice';
import { PreferredDriverSelect } from '../preferredDriver/PreferredDriverSelect';

export type EstimateValues = {
  stops: EstimateStopValues[];
  box_truck_agreement?: boolean;
} & PickOptional<
  MatchData,
  | 'origin_address'
  | 'origin_place_id'
  | 'contract_id'
  | 'self_sender'
  | 'preferred_driver_id'
> &
  ScheduleValues &
  CargoValues;

export type EstimateStopValues = {
  drag_id: string;
} & PickOptional<
  MatchStopData,
  'destination_address' | 'destination_place_id' | 'po' | 'self_recipient'
> &
  PickRequired<MatchStopData, 'index'> &
  CargoStopValues;

export function isEstimateStopValues(
  values: unknown
): values is EstimateStopValues {
  return isObject(values, ['drag_id', 'items']);
}

export function isEstimateValues(values: unknown): values is EstimateValues {
  return isObject(values, ['box_truck_agreement', 'stops']);
}

function isRoute(values: unknown): values is EstimateValues {
  return isEstimateValues(values) ? values.stops.length > 1 : false;
}

export function buildEstimateStopValues(stop?: MatchStop): EstimateStopValues {
  return {
    id: stop?.id,
    drag_id: stop?.id || v4(),
    destination_address: stop
      ? stop?.destination_address.formatted_address
      : '',
    destination_place_id: null,
    needs_pallet_jack: stop?.needs_pallet_jack || false,
    has_load_fee: stop?.has_load_fee || false,
    items: stop?.items.map(i => buildCargoStopItemValues(i)) || [],
    index: stop?.index || 0,
    po: stop?.po,
  };
}

export function buildEstimateValues(
  match: Match | null,
  overrides?: Partial<EstimateValues>
): EstimateValues {
  return {
    scheduled: match ? match.scheduled : false,
    pickup_at: match?.pickup_at || '',
    dropoff_at: match?.dropoff_at || '',
    service_level: match?.service_level || ServiceLevel.Dash,
    timezone: match?.timezone || moment.tz.guess(),
    vehicle_class: match?.vehicle_class || 3,
    origin_address: match ? match.origin_address.formatted_address : '',
    origin_place_id: '',
    unload_method: match?.unload_method || undefined,
    box_truck_agreement: false,
    contract_id: match?.contract?.id,
    preferred_driver_id: undefined,
    stops: match
      ? match.stops.map(stop => buildEstimateStopValues(stop))
      : [buildEstimateStopValues()],
    ...overrides,
  };
}

const estimateStopSchema: SchemaOf<EstimateStopValues> = cargoStopSchema.shape({
  po: yup.string().nullable(),
  drag_id: yup.string().required(),
  destination_address: yup.string().required('Destination address is required'),
  destination_place_id: yup.string().nullable(),
  index: yup.number().required(),
  self_recipient: yup.boolean(),
  items: yup
    .array()
    .of(cargoStopItemSchema)
    .test(
      'requiredWhenRoute',
      'At least one item is required',
      (value, context) => {
        const values = context.options.context;
        if (isRoute(values)) {
          return !!value && value.length > 0;
        }

        return true;
      }
    ),
});

const estimateSchema: SchemaOf<EstimateValues> = cargoSchema
  .shape({
    origin_address: yup.string().required('Origin address is required'),
    origin_place_id: yup.string().nullable(),
    box_truck_agreement: yup.boolean().when('vehicle_class', {
      is: VehicleClass.BoxTruck,
      then: yup
        .boolean()
        .required(
          'You must read & agree to the FRAYT LOGISTICS Broker Shipper Agreement'
        )
        .isTrue(
          'You must read & agree to the FRAYT LOGISTICS Broker Shipper Agreement'
        ),
    }),
    self_sender: yup.boolean(),
    stops: yup
      .array()
      .of(estimateStopSchema)
      .min(1, 'A minimum of 1 stop is required')
      .test(
        'totalDeclaredValueBelowLimit',
        'total declared should be less than 10k',
        function (stops) {
          const total =
            stops?.reduce((sum, stop) => {
              const total_item = stop.items?.reduce((declared, item) => {
                return declared + (item.declared_value || 0);
              }, 0);

              return sum + (total_item || 0);
            }, 0) || 0;

          return total > 1000000
            ? this.createError({
                path: `declared_value`,
                message:
                  'We can insure up to $10,000. If you need additional coverage contact our sales team.',
              })
            : true;
        }
      ),
    contract_id: yup.string().nullable(),
    preferred_driver_id: yup.string().notRequired(),
  })
  .concat(matchScheduleSchema);

export default function Estimate({ showSideBar, changeTab }: ShipTabProps) {
  const dispatch = useAppDispatch();
  const match = useSelector(selectEstimate);
  const boxTruckAgreement = useSelector(selectEstimateBoxTruckAgreement);
  const [initialValues, setInitialValues] = useState<EstimateValues>(
    buildEstimateValues(match, { box_truck_agreement: boxTruckAgreement })
  );
  const navigate = useNavigate();
  const prevMatch = usePrevious(match, null);
  const user = useSelector(selectUser);
  const hasPreferredDriverFeature = useAppSelector(
    state => state.user.featureFlags.preferred_driver
  );

  const handleSubmit = useCallback(
    async (
      values: EstimateValues | { platform: 'deliver_pro' | 'marketplace' },
      actions: FormikChangeHelpers<EstimateValues>
    ) => {
      let action;
      if (match) {
        action = dispatch(
          updateEstimate([
            match.id,
            {
              ...values,
              platform: match.preferred_driver?.id
                ? 'deliver_pro'
                : 'marketplace',
            },
          ])
        );
      } else {
        action = dispatch(createEstimate(values));

        action.unwrap().then(result => navigate('/ship/' + result.response.id));
      }

      action.then(() => actions.setSubmitting(false));
    },
    [dispatch, match, navigate]
  );

  const validate = useCallback((values: EstimateValues) => {
    try {
      estimateSchema.validateSync(values, {
        abortEarly: false,
        context: values,
      });
    } catch (e) {
      return yupToFormErrors(e); // for rendering validation errors
    }
  }, []);

  useEffect(() => {
    dispatch(fetchFeatureFlag({ flag: 'preferred_driver' }));
  }, [dispatch, user]);

  useEffect(() => {
    if (prevMatch !== match) {
      const newValues = buildEstimateValues(match, {
        box_truck_agreement: boxTruckAgreement,
      });

      setInitialValues(newValues);
    }
  }, [match, prevMatch, boxTruckAgreement]);

  const onLoadCsv = useCallback(
    async (est: Partial<EstimateValues>) => {
      const estimate = buildEstimateValues(match, est);
      setInitialValues(estimate);
      await handleSubmit(estimate, {
        setSubmitting: () => {},
      });
    },
    [handleSubmit, match]
  );

  return (
    <div className={showSideBar ? 'shrinkSize' : 'regularSize'}>
      {!match && <MatchCsvUploader onLoad={onLoadCsv} />}
      <Formik
        validateOnMount
        enableReinitialize
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form>
            <EstimateFormOnChange
              onChange={(values: EstimateValues, meta, actions) =>
                handleSubmit(values, actions)
              }
            />
            <StopsRepeater showSideBar={showSideBar} />

            <VehicleClassSelect />

            <ContractSelect />

            <div className='panelDivider' />

            <MatchScheduler />

            {hasPreferredDriverFeature && <PreferredDriverSelect />}

            <StepFooter
              onNext={() => {
                changeTab(1);
              }}
            >
              <EstimateBanner />
            </StepFooter>
          </Form>
        )}
      </Formik>
    </div>
  );
}
