import { useEffect, useState } from 'react';
import { Label } from '@blueprintjs/core';
import 'moment-timezone';
import LoadUnloadToggle from '../LoadUnloadToggle';
import PalletJackToggle from '../PalletJackToggle';
import { ShipTabProps } from '../../../screens/ShipScreen';
import {
  Match,
  MatchData,
  MatchStopData,
  MatchStopItem,
  MatchStopItemData,
  MatchStopItemType,
  UnloadMethod,
} from '../../../lib/actions/MatchAction';
import { useSelector } from 'react-redux';
import {
  selectEstimate,
  updateEstimate,
} from '../../../lib/reducers/estimateSlice';
import * as yup from 'yup';
import { SchemaOf, TestContext } from 'yup';
import { NaNtoEmpty } from '../../../lib/Validation';
import { isObject } from '../../../lib/Utility';
import { Form, Formik, yupToFormErrors } from 'formik';
import { useAppDispatch } from '../../../lib/store';
import StepFooter from '../StepFooter';
import ItemFormGroup from '../ItemFormGroup';
import EstimateFormOnChange from '../EstimateFormOnChange';
import { usePrevious } from '../../../lib/Hooks';
import { FormikChangeHelpers } from '../../form/FormikOnChange';

export type CargoStopItemValues = PickRequired<
  MatchStopItemData,
  | 'declared_value'
  | 'type'
  | 'barcode_pickup_required'
  | 'barcode_delivery_required'
> &
  Partial<MatchStopItemData>;

export type CargoStopValues = {
  items: CargoStopItemValues[];
} & PickOptional<MatchStopData, 'id'> &
  PickRequired<MatchStopData, 'needs_pallet_jack' | 'has_load_fee'>;

export type CargoValues = {
  stops: CargoStopValues[];
} & PickOptional<MatchData, 'vehicle_class' | 'unload_method'>;

export function buildCargoStopItemValues(
  item?: MatchStopItem
): CargoStopItemValues {
  return {
    id: item?.id,
    width: item?.width,
    length: item?.length,
    height: item?.height,
    volume: item?.volume,
    weight: item?.weight,
    pieces: item?.pieces,
    declared_value: item?.declared_value || null,
    description: item ? item.description : '',
    type: item ? item.type : MatchStopItemType.Item,
    barcode: item?.barcode,
    barcode_pickup_required: item ? item.barcode_pickup_required : false,
    barcode_delivery_required: item ? item.barcode_delivery_required : false,
  };
}

export function isCargoStopItemValues(
  values: unknown
): values is CargoStopItemValues {
  return isObject(values, ['type', 'declared_value']);
}

function buildCargoValues(match: Match): CargoValues {
  const stop = match?.stops[0];
  return {
    vehicle_class: match.vehicle_class,
    unload_method: match.unload_method,
    stops: [
      {
        id: stop.id,
        items: [buildCargoStopItemValues(stop.items[0])],
        needs_pallet_jack: stop.needs_pallet_jack,
        has_load_fee: stop.has_load_fee,
      },
    ],
  };
}

const requireItemDimensions = (
  value: number | null | undefined,
  context: TestContext<unknown>
): boolean => {
  const item = context.parent as unknown;
  if (isCargoStopItemValues(item)) {
    const isPallet = item.type === MatchStopItemType.Pallet;
    const hasAnyDimensions = !!(item.width || item.height || item.length);

    if ((!item.volume || hasAnyDimensions) && !isPallet) {
      return !!value;
    }
  }

  return true;
};

export const cargoStopItemSchema: SchemaOf<CargoStopItemValues> = yup.object({
  id: yup.string(),
  width: yup
    .number()
    .typeError('Width must be a valid number')
    .nullable()
    .min(1, 'Width must be at least 1 inch')
    .integer('Width must be rounded to the nearest inch (in)')
    .test(
      'widthRequiredUnlessPalletOrVolume',
      'Width is required unless volume is set',
      requireItemDimensions
    )
    .transform(NaNtoEmpty),
  length: yup
    .number()
    .typeError('Length must be a valid number')
    .nullable()
    .min(1, 'Length must be at least 1 inch')
    .integer('Length must be rounded to the nearest inch')
    .test(
      'lengthRequiredUnlessPalletOrVolume',
      'Length is required unless volume is set',
      requireItemDimensions
    )
    .transform(NaNtoEmpty),
  height: yup
    .number()
    .typeError('Height must be a valid number')
    .nullable()
    .min(1, 'Height must be at least 1 inch')
    .integer('Height must be rounded to the nearest inch')
    .test(
      'heightRequiredUnlessPalletOrVolume',
      'Height is required unless volume is set',
      requireItemDimensions
    )
    .transform(NaNtoEmpty),
  volume: yup
    .number()
    .typeError('Volume must be a valid number')
    .min(1, 'Volume must be at least 1 cubic inch')
    .nullable()
    .transform(NaNtoEmpty),
  weight: yup
    .number()
    .typeError('Weight must be a valid number')
    .required('Weight is required')
    .transform(NaNtoEmpty),
  pieces: yup
    .number()
    .typeError('Pieces must be a valid number')
    .required('Pieces are required')
    .transform(NaNtoEmpty),
  declared_value: yup
    .number()
    .typeError('Declared value must be a valid number')
    .min(0, 'Declared value must be a positive amount')
    .max(
      1000000,
      'We can insure up to $10,000. If you need additional coverage contact our sales team.'
    )
    .required('Declared value is required')
    .transform(NaNtoEmpty),
  description: yup.string().required('Description is required'),
  type: yup
    .mixed<MatchStopItemType>()
    .oneOf(Object.values(MatchStopItemType))
    .required('Item Type is required'),
  barcode: yup.string().nullable(),
  barcode_pickup_required: yup.boolean().required(),
  barcode_delivery_required: yup.boolean().required(),
});

export const cargoStopSchema: SchemaOf<CargoStopValues> = yup.object({
  id: yup.string(),
  needs_pallet_jack: yup.boolean().required(),
  has_load_fee: yup.boolean().required(),
  items: yup.array().of(cargoStopItemSchema),
});

export const cargoSchema: SchemaOf<CargoValues> = yup.object({
  stops: yup.array().of(cargoStopSchema),
  unload_method: yup
    .mixed<UnloadMethod | null>()
    .oneOf(Object.values<UnloadMethod | null>(UnloadMethod).concat(null))
    .when('$vehicle_class', {
      is: 4,
      then: yup
        .mixed<UnloadMethod>()
        .oneOf(Object.values<UnloadMethod>(UnloadMethod))
        .required('Unload method is required for Box Trucks'),
    }),
  vehicle_class: yup.number().required('Vehicle class is required'),
});

type CargoFormProps = {
  match: Match;
} & ShipTabProps;

function CargoForm({ match, changeTab }: CargoFormProps) {
  const dispatch = useAppDispatch();
  const prevMatch = usePrevious(match);
  const [initialValues, setInitialValues] = useState<CargoValues>(
    buildCargoValues(match)
  );

  const handleSubmit = async (
    values: CargoValues,
    actions: FormikChangeHelpers<CargoValues>
  ) => {
    dispatch(updateEstimate([match.id, values])).then(() =>
      actions.setSubmitting(false)
    );
  };

  const validate = (values: CargoValues) => {
    try {
      cargoSchema.validateSync(values, {
        abortEarly: false,
        context: values,
      });
    } catch (e) {
      return yupToFormErrors(e); //for rendering validation errors
    }
  };

  useEffect(() => {
    if (prevMatch !== match) {
      const newValues = buildCargoValues(match);

      setInitialValues(newValues);
    }
  }, [match, prevMatch]);

  return (
    <Formik
      validateOnMount
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={validate}
    >
      {({ values: { vehicle_class } }) => (
        <Form>
          <EstimateFormOnChange
            onChange={(values: CargoValues, meta, actions) =>
              handleSubmit(values, actions)
            }
          />
          <h1 className='u-push__top--none'>Cargo</h1>
          <ItemFormGroup name='stops[0]items[0]' />
          <div className='panelDivider' />

          <Label className='u-pad__top--lg'>OPTIONAL SERVICES</Label>
          <LoadUnloadToggle name='stops[0]' />
          {vehicle_class === 4 && <PalletJackToggle name='stops[0]' />}

          <StepFooter
            onPrev={() => changeTab(-1)}
            onNext={() => changeTab(1)}
          />
        </Form>
      )}
    </Formik>
  );
}

export default function Cargo(props: ShipTabProps) {
  const match = useSelector(selectEstimate);

  if (match) {
    return <CargoForm match={match} {...props} />;
  } else {
    return null;
  }
}
