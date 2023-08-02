import { useCallback, useRef, useEffect } from 'react';
import {
  FieldHookConfig,
  FieldInputProps,
  FieldMetaProps,
  useField,
  useFormikContext,
} from 'formik';
import update from 'immutability-helper';

type FieldArrayHelperProps<V> = {
  push: (value: V) => void;
  swap: (indexA: number, indexB: number) => void;
  move: (from: number, to: number) => void;
  insert: (index: number, value: V) => void;
  unshift: (value: V) => void;
  remove: (index: number) => void;
  pop: () => void;
  replace: (index: number, value: V) => void;
};

type FieldArraySanitizer<V> = (values: V[]) => V[];

type FieldArrayProps<V> = FieldHookConfig<V[]> & {
  sanitizer?: FieldArraySanitizer<V>;
};

export function useFieldArray<V>(
  props: string | FieldArrayProps<V>
): [FieldInputProps<V[]>, FieldMetaProps<V[]>, FieldArrayHelperProps<V>] {
  let fieldConfig = props;
  let sanitizer: FieldArraySanitizer<V> | undefined;
  if (typeof props !== 'string') {
    const { sanitizer: func, ...rest } = props;
    sanitizer = func;
    fieldConfig = rest;
  }

  const [field, meta] = useField<V[]>(fieldConfig);
  const fieldArray = useRef(field.value);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const changeArray = useCallback(
    (name: string) => {
      if (sanitizer) {
        fieldArray.current = sanitizer(fieldArray.current);
      }
      setFieldTouched(name, false);
      setFieldValue(name, fieldArray.current, true);
    },
    [setFieldValue, setFieldTouched, sanitizer]
  );

  useEffect(() => {
    fieldArray.current = field.value;
  }, [field.value]);

  const push = useCallback(
    (value: V) => {
      fieldArray.current = update(fieldArray.current, {
        $push: [value],
      });

      changeArray(field.name);
    },
    [field.name, changeArray]
  );

  const swap = useCallback(
    (indexA: number, indexB: number) => {
      const swapA = fieldArray.current[indexA];
      const swapB = fieldArray.current[indexB];

      fieldArray.current = update(fieldArray.current, {
        $splice: [
          [indexA, 1, swapB],
          [indexB, 1, swapA],
        ],
      });

      changeArray(field.name);
    },
    [field.name, changeArray]
  );

  const move = useCallback(
    (from: number, to: number) => {
      const toMove = fieldArray.current[from];

      fieldArray.current = update(fieldArray.current, {
        $splice: [
          [from, 1],
          [to, 0, toMove],
        ],
      });

      changeArray(field.name);
    },
    [field.name, changeArray]
  );

  const insert = useCallback(
    (index: number, value: V) => {
      fieldArray.current = update(fieldArray.current, {
        $splice: [[index, 0, value]],
      });

      changeArray(field.name);
    },
    [field.name, changeArray]
  );

  const unshift = useCallback(
    (value: V) => {
      fieldArray.current = update(fieldArray.current, {
        $unshift: [value],
      });

      changeArray(field.name);
      return fieldArray.current.length;
    },
    [field.name, changeArray]
  );

  const remove = useCallback(
    (index: number) => {
      const removedItem = fieldArray.current[index];

      fieldArray.current = update(fieldArray.current, {
        $splice: [[index, 1]],
      });

      changeArray(field.name);
      return removedItem;
    },
    [field.name, changeArray]
  );

  const pop = useCallback(() => {
    const lastIndex = fieldArray.current.length - 1;
    const poppedItem = fieldArray.current[lastIndex];

    fieldArray.current = update(fieldArray.current, {
      $splice: [[lastIndex, 1]],
    });

    changeArray(field.name);
    return poppedItem;
  }, [field.name, changeArray]);

  const replace = useCallback(
    (index: number, value: V) => {
      fieldArray.current = update(fieldArray.current, {
        $splice: [[index, 1, value]],
      });

      changeArray(field.name);
    },
    [field.name, changeArray]
  );

  return [
    field,
    meta,
    {
      push,
      swap,
      move,
      insert,
      unshift,
      remove,
      pop,
      replace,
    },
  ];
}
