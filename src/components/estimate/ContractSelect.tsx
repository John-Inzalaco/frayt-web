import { FormGroup, HTMLSelect } from '@blueprintjs/core';
import { Field, useField } from 'formik';
import { useSelector } from 'react-redux';
import { selectUser } from '../../lib/reducers/userSlice';
import { getUserCompany } from '../../lib/Utility';
import { BaseSyntheticEvent } from 'react';

export default function ContractSelect() {
  const user = useSelector(selectUser);
  const company = getUserCompany(user);
  const contracts = company
    ? company.contracts.map(contract => ({
        label: contract.name,
        value: contract.id,
      }))
    : [];

  const [, , { setValue, setTouched }] = useField('contract_id');

  const handleChange = (e: BaseSyntheticEvent) => {
    setTouched(true, false);
    setValue(e.currentTarget.value);
  };

  if (company && contracts.length > 0) {
    return (
      <>
        <div className='panelDivider' />
        <FormGroup
          label='Contract'
          labelFor='contract_id'
          labelInfo='(Optional)'
          className='u-push__top--lg'
        >
          <Field
            as={HTMLSelect}
            name='contract_id'
            options={[{ label: 'None', value: '' }, ...contracts]}
            className='select'
            onChange={handleChange}
            required
            large
          />
        </FormGroup>
      </>
    );
  } else {
    return null;
  }
}
