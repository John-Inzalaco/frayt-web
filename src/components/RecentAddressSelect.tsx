import { useEffect, useState } from 'react';
import {
  IItemListRendererProps,
  IItemRendererProps,
  Select,
  SelectProps,
} from '@blueprintjs/select';
import { Button, MenuItem, Menu } from '@blueprintjs/core';
import { Address, getAddresses } from '../lib/actions/UserAction';

type RecentAddressesSelectProps = Pick<SelectProps<Address>, 'onItemSelect'> &
  Partial<SelectProps<Address>>;

export function RecentAddressesSelect(props: RecentAddressesSelectProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [hover, setHover] = useState(false);

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses();

      setAddresses(response.data.response);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const filterAddress = (query: string, { address }: Address) => {
    return address
      ? address.toLowerCase().indexOf(query.toLowerCase()) >= 0
      : false;
  };

  const renderAddress = (
    { address, lat, lng }: Address,
    { modifiers, handleClick, index }: IItemRendererProps
  ) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }

    return (
      <MenuItem
        text={address}
        key={`address-${lat}-${lng}-${index}`}
        active={modifiers.active}
        disabled={modifiers.disabled}
        onClick={handleClick}
      />
    );
  };

  const renderList = ({
    items,
    itemsParentRef,
    renderItem,
  }: IItemListRendererProps<Address>) => {
    const renderedItems = items
      .map(renderItem)
      .filter(item => item != null)
      .slice(0, 5);
    return (
      <Menu ulRef={itemsParentRef} className='recent-address-select-overlay'>
        <div className='title'>Frequent Addresses</div>
        {renderedItems}
      </Menu>
    );
  };

  const style = {
    borderRadius: '0 3px 3px 0',
    borderWidth: 1,
    borderColor: hover ? '#162fda' : '#919191',
    backgroundColor: hover ? '#162fda' : '#919191',
    color: '#fff',
  };

  return (
    <Select
      items={addresses}
      itemRenderer={renderAddress}
      itemListRenderer={renderList}
      itemPredicate={filterAddress}
      className='recent-address-select'
      {...props}
    >
      <Button
        rightIcon='property'
        style={style}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      />
    </Select>
  );
}
