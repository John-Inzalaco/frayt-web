import { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import MatchListItem from './MatchListItem';
import InfiniteScroll from 'react-infinite-scroller';
import { BarLoader } from 'react-spinners';
import { NonIdealState, Button } from '@blueprintjs/core';
import { Match, MatchFilters } from '../../lib/actions/MatchAction';
import FiltersForm, { FilterType } from '../FiltersForm';
import { fetchShippers, Shipper } from '../../lib/actions/ShipperAction';
import { getLocationOptions } from '../../lib/Utility';
import { useSelector } from 'react-redux';
import { selectUser } from '../../lib/reducers/userSlice';
import {
  fetchMatches,
  selectAllMatches,
  selectHasMoreMatches,
  selectMatchesFilters,
  selectMatchesStatus,
} from '../../lib/reducers/matchesSlice';
import { useAppDispatch } from '../../lib/store';
import { useDebouncer, useDidMount } from '../../lib/Hooks';

type MatchItemsProps = {
  matches: Match[];
  loading: boolean;
};

function MatchItems({ matches, loading }: MatchItemsProps) {
  if (matches.length !== 0) {
    return (
      <>
        {matches.map(match => (
          <MatchListItem key={match.id} match={match} />
        ))}
      </>
    );
  } else {
    // No matches to display yet; return an empty <div> to prevent errors
    if (!loading) {
      return (
        <NonIdealState
          icon='path-search'
          title='No Matches were found'
          description='A Match is what we call a shipment. You can get started right now by starting your first Match.'
          action={
            <NavLink to='/ship'>
              <Button
                className='bp4-button bp4-large'
                icon='offline'
                text='Ship Now'
              />
            </NavLink>
          }
        />
      );
    }
  }

  return null;
}

type LoadingMatchItemProps = {
  loading: boolean;
};

function LoadingMatchItem({ loading }: LoadingMatchItemProps) {
  return loading ? (
    <div key={0}>
      <MatchListItem loading={loading} />
      <div className='barLoaderContainer'>
        <BarLoader width={100} color='#ff9500' loading={loading} />
      </div>
    </div>
  ) : null;
}

export default function MatchesList() {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const hasMore = useSelector(selectHasMoreMatches);
  const matches = useSelector(selectAllMatches);
  const status = useSelector(selectMatchesStatus);
  const filters = useSelector(selectMatchesFilters);
  const [pause, setPause] = useState(false);
  const didMount = useDidMount();
  const [debounce] = useDebouncer(3000);

  const getMatches = useCallback(
    async (newFilters: Partial<MatchFilters> = {}) => {
      if (status !== 'loading' && newFilters !== filters) {
        try {
          dispatch(fetchMatches({ ...filters, ...newFilters }));
        } catch (error) {
          setPause(true);
          debounce(() => setPause(false));
        }
      }
    },
    [dispatch, debounce, filters, status]
  );

  useEffect(() => {
    if (!didMount) {
      getMatches();
    }
  }, [didMount, getMatches]);

  if (!user) return null;

  const filterTypes: FilterType<MatchFilters, Shipper>[] = [
    {
      name: 'states',
      type: 'select',
      label: 'All Matches',
      options: [
        { label: 'Active Matches', value: 'active' },
        { label: 'Completed Matches', value: 'complete' },
        { label: 'Scheduled Matches', value: 'scheduled' },
        { label: 'Canceled Matches', value: 'canceled' },
        { label: 'Failed Pickup Matches', value: 'unable_to_pickup' },
      ],
    },
    {
      type: 'text',
      position: 'right',
      name: 'search',
      icon: 'search',
      label: 'Search',
    },
  ];

  if (user.role === 'company_admin' && user.company) {
    filterTypes.push({
      name: 'location_id',
      type: 'select',
      label: 'All Locations',
      options: getLocationOptions(user),
    });
  }

  if (user.location)
    filterTypes.push({
      name: 'shipper_id',
      type: 'suggest',
      defaultItems: [
        {
          id: '',
          first_name: 'All',
          last_name: 'Shippers',
          email: '',
          phone: '',
          role: 'member',
          role_label: '',
          state: null,
          location: null,
        },
        { ...user, email: '', first_name: 'My', last_name: 'Matches' },
      ],
      renderLabel: ({ email }) => email,
      renderText: ({ first_name, last_name }) => `${first_name} ${last_name}`,
      itemPredicate: (query, { first_name, last_name, email }) => {
        const target = `${first_name} ${last_name} ${email}`.toLowerCase();

        return target.indexOf(query.toLowerCase()) >= 0;
      },
      fetchItems: async (query, { location_id }) => {
        const response = await fetchShippers({
          query,
          location_id,
          cursor: 0,
          per_page: 10,
        });

        return response.data.data;
      },
    });

  return (
    <div>
      <FiltersForm
        filterTypes={filterTypes}
        initialFilters={filters}
        onFilter={filters => getMatches(filters)}
      />
      <InfiniteScroll
        pageStart={0}
        loadMore={() => getMatches({ page: filters.page + 1 })}
        hasMore={hasMore && !pause}
        initialLoad={false}
        threshold={500}
      >
        <MatchItems matches={matches} loading={status === 'loading'} />
        <LoadingMatchItem loading={status === 'loading'} />
      </InfiniteScroll>
    </div>
  );
}
