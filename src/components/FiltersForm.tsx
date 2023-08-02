import {
  HTMLSelect,
  InputGroup,
  MaybeElement,
  OptionProps,
} from '@blueprintjs/core';
import { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16';
import {
  FieldProps,
  Form,
  Formik,
  FormikValues,
  useField,
  useFormikContext,
} from 'formik';
import { ChangeEvent } from 'react';
import { useDebouncer } from '../lib/Hooks';

import SearchSelect, { SearchSelectProps } from './SearchSelect';

type FiltersFormProps<V, T> = {
  onFilter: (values: V) => void;
  filterTypes: FilterType<V, T>[];
  initialFilters: V;
};

export type FilterType<V = FormikValues, T = unknown> = {
  name: Extract<keyof V, string>;
  position?: 'right' | 'left';
} & (
  | ({ type: 'text' } & FilterTextInputProps)
  | ({ type: 'suggest' } & FilterSearchSelectProps<V, T>)
  | ({ type: 'select' } & FilterSelectProps)
);

type FilterTextInputProps = {
  label: string;
  icon?: MaybeElement | BlueprintIcons_16Id;
};

type FilterSelectProps = {
  label: string;
  options: OptionProps[];
};

type FilterSearchSelectProps<V, T> = Omit<
  SearchSelectProps<V, T>,
  'onChange' | 'value'
>;

function FilterTextInput<V>({
  field: { onChange, value, ...field },
  form,
  label,
  icon,
  ...props
}: FilterTextInputProps & FilterInputProps<V>) {
  const [debounce] = useDebouncer(500);
  const { submitForm } = useFormikContext<V>();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event);

    debounce(submitForm);
  };
  return (
    <InputGroup
      {...props}
      {...field}
      value={value || ''}
      onChange={handleChange}
      leftIcon={icon}
      type='search'
      placeholder={label}
      className='search-input bp4-input-group-icon'
      large
    />
  );
}

function FilterSelect<V>({
  field: { onChange, ...field },
  form,
  label,
  options,
  ...props
}: FilterSelectProps & FilterInputProps<V>) {
  const { submitForm } = useFormikContext<V>();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event);

    submitForm();
  };
  return (
    <HTMLSelect
      {...field}
      {...props}
      onChange={handleChange}
      options={[{ label, value: '' }, ...options]}
      large
      className='select'
      multiple={undefined}
    />
  );
}

function FilterSearchSelect<V, T>({
  field,
  form,
  ...props
}: FilterSearchSelectProps<V, T> & FilterInputProps<V>) {
  const { submitForm } = useFormikContext<V>();
  return <SearchSelect {...field} {...props} onChange={submitForm} />;
}

function FilterInput<V, T>({
  name,
  position,
  type,
  ...rest
}: FilterType<V, T>) {
  const id = 'filter_' + name;
  const [field, meta] = useField<V[typeof name]>(name);
  const props = { id, field, meta, ...rest };

  switch (type) {
    case 'select':
      return (
        <FilterSelect {...(props as FilterSelectProps & FilterInputProps<V>)} />
      );
    case 'suggest':
      return (
        <FilterSearchSelect
          {...(props as FilterSearchSelectProps<V, T> & FilterInputProps<V>)}
        />
      );

    case 'text':
      return (
        <FilterTextInput
          {...(props as FilterTextInputProps & FilterInputProps<V>)}
        />
      );
  }
}

type FilterInputProps<V> = {
  id: string;
  name: Extract<keyof V, 'string'>;
} & FieldProps;

export default function FiltersForm<V extends FormikValues, T>({
  onFilter,
  filterTypes,
  initialFilters,
}: FiltersFormProps<V, T>) {
  const [left, right] = filterTypes.reduce<
    [FilterType<V, T>[], FilterType<V, T>[]]
  >(
    ([l, r], filter) => {
      return filter.position === 'right'
        ? [l, [...r, filter]]
        : [[...l, filter], r];
    },
    [[], []]
  );

  return (
    <Formik initialValues={initialFilters} onSubmit={onFilter}>
      <Form className='filters'>
        <div>
          {left.map(filterType => (
            <div key={filterType.name}>
              <FilterInput {...filterType} />
            </div>
          ))}
        </div>
        <div>
          {right.map(filterType => (
            <div key={filterType.name}>
              <FilterInput {...filterType} />
            </div>
          ))}
        </div>
      </Form>
    </Formik>
  );
}
