import { TimePrecision } from '@blueprintjs/datetime';
import { DateInput2, DateInput2Props } from '@blueprintjs/datetime2';
import { useField } from 'formik';
import moment, { Moment } from 'moment';
import { nearestFutureStep } from '../../lib/Utility';

type DateTimeTZInputProps = {
  name: string;
  timezoneName: string;
  defaultTime?: Date;
  disabled?: boolean;
  disabledDates?: Moment[];
  maxDate?: Moment;
  minDate?: Moment;
  stepSize?: number;
} & Pick<DateInput2Props, 'placeholder'>;

export default function DateTimeTZInput({
  name,
  timezoneName,
  disabled,
  disabledDates,
  defaultTime,
  maxDate,
  minDate,
  stepSize = 1,
  ...props
}: DateTimeTZInputProps) {
  const [, { value: timezone }] = useField<string>(timezoneName);

  const [, meta, helpers] = useField<string | null>(name);
  const { value } = meta;

  const { setValue, setTouched } = helpers;

  const minDateCheck = (date: Moment) => {
    if (!minDate) return date;
    if (date.isBefore(minDate)) return nearestFutureStep(minDate, stepSize);

    return date;
  };

  const handleChange = (selectedDate: string) => {
    const value = minDateCheck(moment(selectedDate)).tz('UTC');

    setValue(value.toISOString());
    setTouched(true, false);
  };

  return (
    <>
      <DateInput2
        {...props}
        highlightCurrentDay
        closeOnSelection={false}
        dayPickerProps={{ disabledDays: disabledDates?.map(d => d.toDate()) }}
        timePickerProps={{ useAmPm: true }}
        minDate={minDate?.toDate()}
        maxDate={maxDate?.toDate()}
        initialMonth={value ? moment(value).toDate() : minDate?.toDate()}
        parseDate={str => (str ? moment(str).toDate() : null)}
        formatDate={date => moment(date).format('MMM D, YYYY h:mm A z')}
        value={value}
        onChange={handleChange}
        timePrecision={TimePrecision.MINUTE}
        defaultTimezone={timezone || moment.tz.guess()}
      />
    </>
  );
}
