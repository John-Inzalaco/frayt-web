import React, { CSSProperties, useCallback, useMemo, useState } from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import csv from 'csvtojson';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Button, Spinner } from '@blueprintjs/core';
import { EstimateStopValues, EstimateValues } from './steps/Estimate';
import { selectEstimateStatus } from '../../lib/reducers/estimateSlice';
import { useSelector } from 'react-redux';
import { MatchStopItemData } from '../../lib/actions/MatchAction';
import { selectUser } from '../../lib/reducers/userSlice';
import { getUserCompany } from '../../lib/Utility';
import { User } from '../../lib/actions/UserAction';

const baseStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#999',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#999',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  height: 100,
  verticalAlign: 'middle',
};

const focusedStyle: CSSProperties = {
  borderColor: '#2196f3',
};

const acceptStyle: CSSProperties = {
  borderColor: '#00e676',
};

const rejectStyle: CSSProperties = {
  borderColor: '#ff1744',
};

export type MatchCsvUploaderProps = {
  onLoad: (payload: Partial<EstimateValues>) => unknown;
};

type MatchCsvRow = {
  origin_address: string;
  destination_address: string;
  vehicle_class: number;
  contract: 'frayt_dash' | 'frayt_same_day';
  contract_key: string;
  service_level: number;
  pickup_at: string;
  dropoff_at: string;
  bill_of_lading_required: boolean;
  origin_photo_required: boolean;
  destination_photo_required: boolean;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  notify_sender: boolean;
  pickup_notes: string;
  po: string;
  item_description: string;
  item_pieces: number;
  item_total_weight: number;
  item_width: number;
  item_length: number;
  item_height: number;
  item_volume: number;
  declared_value: number;
  load_unload: boolean;
  dropoff_notes: string;
  signature_required: boolean;
  signature_type: string;
  signature_instructions: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  notify_recipient: boolean;
};

const serviceLevels: { [key: string]: number } = {
  frayt_dash: 1,
  frayt_same_day: 2,
};

const uniqueFields: (keyof MatchCsvRow)[] = [
  'origin_address',
  'contract',
  'contract_key',
  'vehicle_class',
  'pickup_at',
  'dropoff_at',
  'bill_of_lading_required',
  'origin_photo_required',
  'sender_name',
  'sender_email',
  'sender_phone',
  'notify_sender',
  'pickup_notes',
];

const validateRow = (
  first: MatchCsvRow,
  other: MatchCsvRow,
  line: number
): unknown[] => {
  return uniqueFields
    .filter(field => first[field] !== other[field])
    .map(field => (
      <>
        <b>{field}</b> value at the line #{line} should be equal to{' '}
        <b>{field}</b> value at the line #1
      </>
    ));
};

const defaultError = 'Something went wrong. Please try again later.';
const errorsMap: { [key: string]: string } = {
  'file-too-large': 'The file should not be larger than 1MB.',
  'file-invalid-type': 'The file you tried to upload is not a CSV.',
  'too-many-files': 'Only one file is allowed at a time.',
  'file-too-small': 'The file you tried to upload is empty.',
};

const isTruty = (value: unknown): boolean => {
  const v = `${value || ''}`.trim();

  return /^(true|1|yes|y|t)$/i.test(v);
};

const getContractId = (
  user: User | null,
  key: string | null
): string | null => {
  if (!user) return null;
  const company = getUserCompany(user);
  if (!company) return null;
  const contract = company.contracts.find(c => c.contract_key === key);

  return contract?.id || null;
};

export function MatchCsvUploader(props: MatchCsvUploaderProps) {
  const [dropZoneIsOpen, setDropZoneIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [csvErrors, setCsvErrors] = useState<unknown[]>();
  const estimating = useSelector(selectEstimateStatus) === 'loading';
  const user = useSelector(selectUser);

  const onLoadCsv = useCallback(
    async (_evt: ProgressEvent, reader: FileReader) => {
      const result = await csv({ trim: true }).fromString(
        reader.result?.toString() || ''
      );
      const rows = result as MatchCsvRow[];
      const [first, ...remainingRows] = rows;
      const validation = remainingRows.flatMap((row, index: number) =>
        validateRow(first, row, index + 2)
      );

      if (!validation.length) {
        const service_level = serviceLevels[first.contract];
        const contract = service_level ? null : first.contract;
        const vehicle_class = +first.vehicle_class;
        const self_sender = !(
          first.sender_name ||
          first.sender_phone ||
          first.sender_email ||
          first.notify_sender
        );

        const init = {
          stops: [],
          origin_address: first.origin_address,
          vehicle_class,
          service_level: service_level || 1,
          contract,
          pickup_at: first.pickup_at,
          dropoff_at: first.dropoff_at,
          bill_of_lading_required: first.bill_of_lading_required,
          origin_photo_required: first.origin_photo_required,
          pickup_notes: first.pickup_notes,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          scheduled: !!(first.pickup_at || first.dropoff_at),
          self_sender,
          contract_id: getContractId(user, first.contract_key),
        } as EstimateValues;

        const estimate = {
          ...init,
          sender: self_sender
            ? null
            : {
                name: first.sender_name,
                email: first.sender_email,
                phone_number: first.sender_phone,
                notify: isTruty(first.notify_sender),
              },
          po: rows.length === 1 ? first.po : null,
        } as EstimateValues;

        const weightInfo: { [key: string]: unknown } = {};

        rows.forEach((row, index) => {
          weightInfo[`stops[${index}]items[0].weight`] = +row.item_total_weight;
          weightInfo[`stops[${index}]items[0].weightCsv`] = true;
          const self_recipient = !(
            row.recipient_name ||
            row.recipient_phone ||
            row.recipient_email ||
            row.notify_recipient
          );

          const volumeIsSet = !!row.item_volume;

          const initStop = {
            id: `${index}`,
            destination_address: row.destination_address,
            drag_id: btoa(row.destination_address),
            po: row.po,
            index: index,
            self_recipient,
            has_load_fee: isTruty(row.load_unload),
            items: [
              {
                id: `${index}`,
                description: row.item_description,
                pieces: +row.item_pieces,
                volume: volumeIsSet ? +row.item_volume : null,
                width: volumeIsSet ? null : +row.item_width,
                length: volumeIsSet ? null : +row.item_length,
                height: volumeIsSet ? null : +row.item_height,
                declared_value: +row.declared_value,
                type: 'item',
                weight: +row.item_total_weight / (+row.item_pieces || 1),
              },
            ] as MatchStopItemData[],
          } as EstimateStopValues;

          const signature_type = `${
            row.signature_type || 'electronic'
          }`.toLowerCase();

          const stop = {
            ...initStop,
            recipient: self_recipient
              ? null
              : {
                  name: row.recipient_name,
                  email: row.recipient_email,
                  phone_number: row.recipient_phone,
                  notify: isTruty(row.notify_recipient),
                },
            signature_type,
            signature_required: isTruty(row.signature_required),
            signature_instructions: row.signature_instructions,
            load_unload: row.load_unload,
            delivery_notes: row.dropoff_notes,
            destination_photo_required: isTruty(row.destination_photo_required),
          } as EstimateStopValues;

          estimate.stops.push(stop);
        });

        sessionStorage.setItem('weightInfo', JSON.stringify(weightInfo));
        props.onLoad(estimate);
      } else {
        setCsvErrors(validation);
      }
      setIsLoading(false);
    },
    [props, user]
  );

  const onDrop = useCallback(
    (files: File[]) => {
      if (!files.length || files.length > 1) return;
      const file = files[0];
      if (file.size === 0) {
        setCsvErrors(["The file you're uploading is empty."]);
        return;
      }
      setIsLoading(true);
      const reader = new FileReader();
      reader.onabort = () => setIsLoading(false);
      reader.onerror = () => setIsLoading(false);
      reader.onload = evt => onLoadCsv(evt, reader).then();
      reader.readAsText(file);
    },
    [onLoadCsv]
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const fileRejection = rejections[0];
    const error = fileRejection.errors[0];
    setCsvErrors([errorsMap[error.code] || defaultError]);
  }, []);

  const onFileDialogOpen = useCallback(() => setCsvErrors([]), []);
  const onDragOver = useCallback(() => setCsvErrors([]), []);
  const handleClick = useCallback(() => {
    if (dropZoneIsOpen) setCsvErrors([]);
    setDropZoneIsOpen(!dropZoneIsOpen);
  }, [dropZoneIsOpen]);

  const dz = useDropzone({
    onDrop,
    onDragOver,
    onFileDialogOpen,
    onDropRejected,
    accept: { 'text/csv': ['.csv'] },
    maxSize: 1000_000,
    maxFiles: 1,
    multiple: false,
  });
  const { isFocused, isDragAccept, isDragReject } = dz;

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  const btnSuffix = dropZoneIsOpen && !isLoading && !estimating ? 'Filled' : '';

  return (
    <div style={{ marginBottom: 5 }}>
      <Grid>
        <Row>
          <Col style={{ paddingLeft: 0 }}>
            <Button
              className={`primaryButton${btnSuffix}`}
              active={dropZoneIsOpen && !isLoading}
              onClick={handleClick}
              style={{ marginBottom: 5 }}
              icon={'upload'}
              disabled={isLoading}
              hidden={estimating}
            >
              Upload CSV
            </Button>
          </Col>
          <Col style={{ paddingLeft: 5 }}>
            {!!csvErrors?.length &&
              csvErrors.map((err: unknown, index) => (
                <p key={`csv-error-${index}`} className={'error'}>
                  {err as string}
                </p>
              ))}
          </Col>
        </Row>
      </Grid>
      {(isLoading || estimating) && <Spinner size={40} />}
      {dropZoneIsOpen && !isLoading && !estimating && (
        <div>
          <div {...dz.getRootProps({ style })}>
            <input {...dz.getInputProps()} />
            <p style={{ marginTop: 20 }}>
              Drag & drop some files here, or click to select files
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
