import { Menu, MenuItem } from '@blueprintjs/core';
import { Suggest, SuggestProps } from '@blueprintjs/select';
import { FormikValues, useFormikContext } from 'formik';
import { useState } from 'react';
import { useDebouncer } from '../lib/Hooks';

export type SearchSelectProps<V, T = unknown> = {
  name: Extract<keyof V, string>;
  value: string | null;
  onChange: (item: SearchSelectItem<T>) => Promise<void> | void;
  renderText: (item: SearchSelectItem<T>) => string;
  renderLabel: (item: SearchSelectItem<T>) => string;
  fetchItems: (query: string, values: V) => Promise<SearchSelectItem<T>[]>;
  defaultItems?: SearchSelectItem<T>[];
} & Omit<
  SuggestProps<SearchSelectItem<T>>,
  | 'onQueryChange'
  | 'onItemSelect'
  | 'selectedItem'
  | 'itemListRenderer'
  | 'items'
  | 'inputValueRenderer'
  | 'itemRenderer'
>;

export type SearchSelectItem<T> = {
  id: string;
} & T;

export default function SearchSelect<V = FormikValues, T = unknown>({
  name,
  value: rawValue,
  fetchItems,
  renderLabel,
  renderText,
  onChange,
  defaultItems = [],
  ...props
}: SearchSelectProps<V, T>) {
  const value = rawValue || '';
  const [debounce, clearDebounce] = useDebouncer(500);
  const { setFieldValue, values } = useFormikContext<V>();
  const [results, setResults] = useState<SearchSelectItem<T>[]>(defaultItems);
  const [loading, setLoading] = useState(false);

  const defaultIds = defaultItems.map(i => i.id);

  const isNotDefaultItem = ({ id }: SearchSelectItem<T>) =>
    !defaultIds.includes(id);

  const cancelSearch = () => {
    clearDebounce();

    setLoading(false);
  };

  const handleQueryChange = (query: string) => {
    cancelSearch();

    let items = defaultItems;

    if (query) {
      debounce(async () => {
        setLoading(true);

        try {
          const results = await fetchItems(query, values);

          items = items.concat(results.filter(isNotDefaultItem));

          setResults(items);
        } catch (e) {
          console.warn(e);
        }

        setLoading(false);
      });
    }
  };

  const selectItem = (item: SearchSelectItem<T>) => {
    cancelSearch();

    if (item.id !== value) {
      setFieldValue(name, item.id);

      onChange(item);
    }
  };

  const selectedItem = results.find(({ id }) => value === id);

  return (
    <Suggest
      onQueryChange={handleQueryChange}
      onItemSelect={selectItem}
      closeOnSelect={true}
      openOnKeyDown={false}
      resetOnClose={true}
      resetOnSelect={true}
      selectedItem={selectedItem}
      itemListRenderer={({ filteredItems, query, renderItem }) => {
        return (
          <Menu>
            {filteredItems.map(renderItem).filter(item => item != null)}
            {loading && (
              <MenuItem
                active={false}
                disabled={true}
                key={'loading'}
                text={'Loading...'}
              />
            )}

            {query &&
              filteredItems.filter(isNotDefaultItem).length === 0 &&
              !loading && (
                <MenuItem
                  active={false}
                  disabled={true}
                  key={'no_results'}
                  text={'No Results'}
                />
              )}
          </Menu>
        );
      }}
      items={results}
      itemsEqual='id'
      inputValueRenderer={renderText}
      itemRenderer={(item, { handleClick, handleFocus, modifiers }) => (
        <MenuItem
          active={modifiers.active}
          disabled={modifiers.disabled}
          label={renderLabel(item)}
          key={item.id}
          onClick={handleClick}
          onFocus={handleFocus}
          text={renderText(item)}
        />
      )}
      {...props}
    />
  );
}
