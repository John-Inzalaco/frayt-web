import { useFormikContext } from 'formik';
import { humanize, isObject } from '../../lib/Utility';

type ObjectErrorsProps = {
  errors: { [key: string]: unknown };
};

type DisplayErrorProps = {
  error: unknown;
  name?: string;
};

function DisplayError({ error, name }: DisplayErrorProps) {
  const index = Number(name);
  const label = name && (isNaN(index) ? humanize(name) : `#${index + 1}`);
  if (isObject(error)) {
    return (
      <>
        {label}
        {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
        <ObjectErrors errors={error} />
      </>
    );
  } else if (Array.isArray(error)) {
    const label =
      name && (typeof name === 'string' ? parseInt(name) : name) + 1;
    return (
      <>
        {label}
        {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
        <ArrayErrors errors={error} />
      </>
    );
  } else if (typeof error === 'string') {
    return <p>{error}</p>;
  }

  return null;
}

function ObjectErrors({ errors }: ObjectErrorsProps) {
  return (
    <ul>
      {(Object.keys(errors) as Array<keyof typeof errors>).map(
        (name, index) => {
          const error = errors[name];

          return error ? (
            <li key={index}>
              <DisplayError error={error} name={name.toString()} />
            </li>
          ) : null;
        }
      )}
    </ul>
  );
}

type ArrayErrorsProps = {
  errors: unknown[];
};

function ArrayErrors({ errors }: ArrayErrorsProps) {
  return (
    <ul>
      <>
        {errors.map(
          (error, index) =>
            error && (
              <li key={index}>
                <DisplayError error={error} name={index.toString()} />
              </li>
            )
        )}
      </>
    </ul>
  );
}

export default function FormErrors() {
  const { errors } = useFormikContext<unknown>();

  return (
    <div className='form-errors'>
      <DisplayError error={errors} />
    </div>
  );
}
