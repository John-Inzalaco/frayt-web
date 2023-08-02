import {
  Button,
  Checkbox,
  Classes,
  Dialog,
  Intent,
  Label,
} from '@blueprintjs/core';
import { Field, useField } from 'formik';
import moment from 'moment';
import { FormEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { setBoxTruckAgreement } from '../../lib/reducers/estimateSlice';
import { selectUser } from '../../lib/reducers/userSlice';
import { useAppDispatch } from '../../lib/store';
import TextButton from '../TextButton';

export default function BoxTruckAgreement() {
  const user = useSelector(selectUser);
  const address = user?.address;
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);
  const [{ value }, , { setValue, setTouched }] = useField<boolean | undefined>(
    'box_truck_agreement'
  );

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.checked;
    dispatch(setBoxTruckAgreement(value));
    setTouched(value, false);
    setValue(value, true);
  };

  return user ? (
    <>
      <Label>BOX TRUCKS</Label>
      <Field
        as={Checkbox}
        name='box_truck_agreement'
        checked={value}
        onChange={handleChange}
      >
        <strong>I agree to the FRAYT LOGISTICS Broker Shipper Agreement</strong>
        <br />
        <span style={{ marginTop: 4, display: 'block' }}>
          Our box truck service has an additional agreement. You can read it at
          the{' '}
          <TextButton onClick={openModal}>Broker Shipper Agreement</TextButton>.
        </span>
        <Dialog
          isOpen={isOpen}
          onClose={closeModal}
          hasBackdrop={true}
          className={Classes.OVERLAY_SCROLL_CONTAINER}
          usePortal={true}
          title='Broker Shipper Agreement'
          icon='info-sign'
          style={{ width: '80%' }}
        >
          <div className={Classes.DIALOG_BODY}>
            <p>
              This contract made this {moment().format('dddd')} day of{' '}
              {moment().format('MMMM Do, YYYY')}, by and between{' '}
              {user.first_name} {user.last_name}, located at {address?.address},{' '}
              {address?.city}, {address?.state} {address?.zip}, a domestic
              corporation, hereinafter called &quot;SHIPPER&quot;, and Frayt
              Logistics Technologies LLC, located at 1311 Vine St., Cincinnati,
              OH 45202, a domestic Limited Liability Company, hereinafter called
              &quot;BROKER&quot;.
            </p>
            <p>
              Whereas Broker is engaged in the business of placing loads,
              tendered to it by shipper, for transportation with carriers by
              motor vehicle; and Broker desires to provide its transportation
              services on behalf of the Shipper for the interstate, intrastate
              and foreign transportation of commodities as more specifically
              described hereinafter; and Shipper desires to avail itself of such
              service.
            </p>
            <p>
              Now, therefore, in consideration of the mutual agreements herein
              contained, and the compensation that the Broker will receive from
              the monies that are paid for the transportation, the parties agree
              as follows:
            </p>
            <h3>TERMS:</h3>
            <p>
              This Agreement shall be for one (1) year and shall automatically
              be renewed for successive one (1) year periods; provided, however,
              that this Agreement may be terminated without cause at any time by
              giving thirty (30) days prior written notice to the other Party.
            </p>
            <h3>BROKER COMPLIANCE:</h3>
            <p>
              Broker represents that it is duly authorized to perform such
              services for compensation under a license issued to it by the
              Federal Motor Carrier Safety Administration (FMCSA) in Docket No.
              MC-1095959; and that it holds an effective Surety Bond or Trust
              Fund Agreement under 49 U.S.C. 10927(b) and 49 C.F.R. 1045; and
              that it shall engage only the services of motor carriers duly
              authorized and insured in accordance with the laws and regulations
              of the appropriate federal and/or state regulatory agencies
              including but not limited to the Federal Motor Carrier Safety
              Administration and the United States Department of Transportation.
            </p>
            <p>
              Broker functions as an independent entity, and not as a carrier,
              in selling, negotiating, providing and arranging for
              transportation for compensation, and the actual transportation of
              shipments tendered to Broker shall be performed by third-party
              motor carriers regulated by the Federal Motor Carrier Safety
              Administration.
            </p>
            <h3>PAYMENT and CHARGES:</h3>
            <p>
              Shipper agrees to tender certain loads, from time to time, to
              Broker. The charges as to each shipment shall be agreed to
              electronically by the parties, prior to the movement of the
              shipment. Shipper shall be bound to the rates and charges set
              forth in the Electronic Rate Confirmation and shall be subject in
              all respects to this Agreement at the rates and charges specified
              on Broker’s Electronic Platform and shall constitute an Agreement
              between the Parties regarding the rates and charges of the
              applicable Match payable to Broker under this Electronic Rate
              Confirmation.
            </p>
            <h3>INDEMNIFICATION:</h3>
            <p>
              Indemnification. Broker will defend, indemnify and hold harmless
              Shipper from and against all claims, lawsuits, demands, liability,
              costs, caused by, arising out of or connected with any injury to
              or death of persons, or damage to property, including cargo, which
              arise from the use of carriers not meeting the requirements
              specified in this agreement. Broker will defend, indemnify and
              hold harmless Shipper from and against all claims, lawsuits,
              demands, liability, costs, and expenses caused by, arising out of
              or connected with broker’s failure to adhere to applicable federal
              and state laws and regulations governing the services from a
              Broker. The Broker however shall not be responsible for any
              damages caused by the negligence of Shipper or Shipper’s agents.
            </p>
            <h3>INSURANCE:</h3>
            <p>
              Without regard to such lesser limits as may be required by law,
              Broker will ensure that each carrier will carry public liability
              insurance covering its vehicles involved in the performance of
              this Agreement in an amount of at least $1 million for a single
              occurrence. Broker will also ensure each carrier will carry cargo
              insurance, in an amount not less than $100,000 or such higher
              amount as requested by Shipper and expressly agreed to in writing
              by broker to respond to loss of a shipment tendered by Shipper,
              Shipper’s vendors, or Shipper’s consignees. The shipper shall
              disclose the value and nature of the shipment.
            </p>
            <h3>BROKER INSURANCE:</h3>
            <p>
              Broker shall comply with all insurance and bonding requirements
              imposed upon it by law, including its obligation to maintain a
              surety bond to benefit the Shipper.
            </p>
            <h3>INDEPENDENT CONTRACTOR:</h3>
            <p>
              It is understood between the parties that Broker shall remain an
              independent contractor under this contract and that its agents
              and/or employees are under its exclusive management and control
              and that Shipper neither exercises nor retains any control or
              supervision of or over Broker, or its operations, agents or
              employees in any manner whatsoever.
            </p>
            <h3>CONTRACT CARRIERS:</h3>
            <p>
              Broker agrees to make every reasonable effort to place such loads
              with contract carriers for the purpose of transporting the loads
              with reasonable dispatch under the direction of the Shipper.
            </p>
            <h3>CARGO LOSS, DAMAGE, SHORTAGE:</h3>
            <p>
              The Parties agree that in the event Shipper determines it has a
              claim for cargo loss or damage against any carrier transporting a
              load tendered to it by Broker, the Broker will act as
              administrator for the claim and insure that all claims are filed
              and processed in accordance with 49 C.F.R. 1005. All matters
              pertaining to rates and charges should be solely between Shipper
              and Broker. No claims or allowances for shortages, damage or delay
              will be considered unless clearly noted on the delivery receipt or
              bill of lading signed by the consignee at delivery. Broker shall
              have no liability for cargo loss, damage, or shortage except to
              the extent such claims are caused by Broker’s negligent acts or
              omissions.
            </p>
            <h3>SHIPPING DOCUMENTS:</h3>
            <p>
              Unless otherwise agreed in writing, all shipments tendered shall
              be accepted on Broker’s Electronic Platform which shall function
              as a receipt of the goods only; the terms and conditions of such
              will not apply to transportation provided pursuant to this
              Agreement. Upon request of Shipper, Broker shall instruct Carriers
              to obtain a delivery receipt from the consignee, showing the
              products delivered, condition of the shipment and the date and
              time of such delivery.
            </p>
            <h3>GOVERNING LAW:</h3>
            <p>
              This instrument constitutes the entire agreement of the parties
              with reference to the subject matter hereof, and may not be
              changed, waived, or modified except in writing signed by both
              parties. This contract shall be construed in accordance with the
              laws of the State of Ohio.
            </p>
            <h3>DISPUTES:</h3>
            <p>
              This Agreement shall be deemed to have been drawn in accordance
              with the statutes and laws of the state of Ohio and in the event
              of any disagreement or dispute, the laws of Ohio shall apply and
              suit must be brought in Ohio as each party specifically submits to
              the exclusive personal jurisdiction of such courts for disputes
              involving this Agreement. Notwithstanding the foregoing, the
              parties may mutually agree in writing to submit any such
              disagreement to binding arbitration.
            </p>
            <h3>NO ASSIGNMENT:</h3>
            <p>
              There shall be no assignment or transfer, in whole or in part, of
              any right, duty, responsibility, or obligation contained in this
              Agreement, including the right to receive payments, unless such
              assignment or transfer is agreed to by both parties in writing.
            </p>
            <h3>DISCLOSURES:</h3>
            <p>
              Broker and Shipper shall not make any disclosure of the material
              terms of this Agreement to any third party except to the extent
              that, such disclosure is required by law. Either party may make
              any such disclosure to its auditors. Shipper shall have the right
              to disclose any such terms, conditions, or information to the
              consignors or consignees of the individual shipments moving
              between Shipper and the applicable vendor or consignee.
            </p>
            <h3>NOTICE:</h3>
            <p>
              All notices under this Agreement shall be in writing and shall be
              properly given and delivered in person or sent by electronic mail,
              first class mail, facsimile, or overnight delivery service,
              postage prepaid, addressed as provided for by the parties.
            </p>
            <h3>FORCE MAJEURE:</h3>
            <p>
              If either party is prevented from performing any of its
              obligations hereunder by reason of fire, flood, windstorm, other
              act of God, labor dispute, act of government, the failure of the
              other party, or any other unforeseen cause beyond the control of
              such party it shall be excused from performing the obligation it
              is so prevented from performing during the pendency of such Event
              of Force Majeure. Occurrence of any Event of Force Majeure shall
              not extend the term of this Agreement. Each party agrees to give
              the other party immediate oral notice of an Event of Force
              Majeure, stating its course and probable duration, followed by
              written notice as soon as practical. Such party shall notify the
              other party immediately upon termination of such cause.
            </p>
            <h3>COMPLETE AGREEMENT:</h3>
            <p>
              This Agreement constitutes the entire agreement of the parties
              with reference to the subject matters herein, and may not be
              changed, waived, or modified except in writing signed by both
              parties.
            </p>
            <p>
              IN WITNESS WHEREOF, the parties have caused this Contract to be
              executed as of the day and year first written above.
            </p>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                intent={Intent.PRIMARY}
                onClick={closeModal}
                style={{ margin: '' }}
              >
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      </Field>
    </>
  ) : (
    <p>Please login to continue</p>
  );
}
