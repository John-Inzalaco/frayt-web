import { useEffect, useMemo } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { useSelector } from 'react-redux';
import FiltersForm, { FilterType } from '../../components/FiltersForm';
import { getLocationOptions } from '../../lib/Utility';
import {
  fetchShippers,
  selectAllShippers,
} from '../../lib/reducers/shippersSlice';
import { useAppDispatch } from '../../lib/store';
import { selectUser } from '../../lib/reducers/userSlice';
import { RootState } from '../../lib/reducers';
import { Shipper, ShippersFilters } from '../../lib/actions/ShipperAction';
import ShippersList from '../../components/shippers/ShippersList';
import { useDidMount } from '../../lib/Hooks';

export default function UserManagement() {
  const user = useSelector(selectUser);
  const shippers = useSelector<RootState, Shipper[]>(state =>
    user ? selectAllShippers(state, [user.id]) : []
  );
  const didMount = useDidMount();
  const dispatch = useAppDispatch();
  const initialFilters = useMemo(
    () => ({
      disabled: false,
    }),
    []
  );

  useEffect(() => {
    if (!didMount && shippers.length === 0)
      dispatch(fetchShippers(initialFilters));
  }, [didMount, initialFilters, dispatch, shippers]);

  if (!user) return null;

  const filterTypes: FilterType<ShippersFilters>[] = [
    {
      name: 'disabled',
      type: 'select',
      label: 'All Statuses',
      options: [
        { label: 'Enabled', value: 'false' },
        { label: 'Disabled', value: 'true' },
      ],
    },
    {
      name: 'role',
      type: 'select',
      label: 'All Roles',
      options: [
        { label: 'Company Admin', value: 'company_admin' },
        { label: 'Location Admin', value: 'location_admin' },
        { label: 'Member', value: 'member' },
      ],
    },
    {
      type: 'text',
      position: 'right',
      name: 'query',
      icon: 'search',
      label: 'Search',
    },
  ];

  if (user.role === 'company_admin' && user.company)
    filterTypes.push({
      name: 'location_id',
      type: 'select',
      label: 'All Locations',
      options: getLocationOptions(user),
    });

  return (
    <Row style={{ marginBottom: 20 }}>
      <Col xs={12} md={12}>
        <h1 className='pageTitle'>User Management</h1>
      </Col>
      <Col xs={12} md={12}>
        <FiltersForm
          filterTypes={filterTypes}
          initialFilters={initialFilters}
          onFilter={filters => dispatch(fetchShippers(filters))}
        />
        <ShippersList
          shippers={shippers}
          showRole={user.role === 'company_admin'}
        />
      </Col>
    </Row>
  );
}
