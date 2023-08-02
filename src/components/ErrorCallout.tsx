import { Callout } from '@blueprintjs/core';

export default function ErrorCallout({ error }: { error: string | null }) {
  return error ? (
    <Callout
      intent='danger'
      className='calloutError'
      title={'We encountered a problem'}
    >
      {error}
    </Callout>
  ) : null;
}
