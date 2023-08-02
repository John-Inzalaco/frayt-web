import MatchSectionControl, { MatchSectionProps } from './MatchSectionControl';

type StopPhotos = {
  name: string;
  url: string | null;
  description?: string | null;
}[];

export default function DocumentsSection({
  match,
  isActive,
  showMore,
  goBack,
}: MatchSectionProps) {
  const { origin_photo, bill_of_lading_photo, stops } = match;
  const photos: StopPhotos = [
    { name: 'ORIGIN PHOTO', url: origin_photo },
    { name: 'BILL OF LADING', url: bill_of_lading_photo },
  ];

  stops.forEach(
    ({ index, destination_photo, signature_photo, signature_name }) => {
      photos.push({ name: `#${index + 1} POD PHOTO`, url: destination_photo });
      photos.push({
        name: `#${index + 1} SIGNATURE PHOTO`,
        url: signature_photo,
        description: signature_name && `Signed by ${signature_name}`,
      });
    }
  );

  const hasPhotos = photos.some(photo => photo.url);

  return (
    <MatchSectionControl
      isActive={isActive}
      goBack={goBack}
      showMore={showMore}
      title='Documents'
    >
      {isActive &&
        (hasPhotos ? (
          photos.map(({ name, url, description }, index) => (
            <div className='infoBox' key={index}>
              <p className='heading'>{name}</p>
              {url ? (
                <a href={url}>
                  <img src={url} className='matchPhoto' alt={name} />
                </a>
              ) : (
                <p>N/A</p>
              )}
              {description && <i>{description}</i>}
            </div>
          ))
        ) : (
          <div className='infoBox'>
            <p className='heading'>
              This match does not contain any documents.
            </p>
          </div>
        ))}
    </MatchSectionControl>
  );
}
