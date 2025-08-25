import { faCalendarCheck, faClipboardList, faDollarSign, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function KeyMetrics() {
    return(
        <section className="mt-6">
            <div className="flex gap-4">
                <div className="keymetrics-card">
                    <div className="keymetrics-card-header">
                        <h1>Orders</h1>
                        <FontAwesomeIcon icon={faClipboardList} className="text-2xl"/>
                    </div>
                    <p className="keymetrics-card-content">201</p>
                    <p className="keymetrics-card-footer">increased by 15% last month</p>
                </div>
                <div className="keymetrics-card">
                    <div className="keymetrics-card-header">
                        <h1>Average Rating</h1>
                        <FontAwesomeIcon icon={faStar} className="text-2xl"/>
                    </div>
                    <p className="keymetrics-card-content">201</p>
                    <p className="keymetrics-card-footer">from 120 customer reviews</p>
                </div>
                <div className="keymetrics-card">
                    <div className="keymetrics-card-header">
                        <h1>Revenue</h1>
                        <FontAwesomeIcon icon={faDollarSign} className="text-2xl"/>
                    </div>
                    <p className="keymetrics-card-content">5,000</p>
                    <p className="keymetrics-card-footer">increased by 15% last month</p>
                </div>
                <div className="keymetrics-card">
                    <div className="keymetrics-card-header">
                        <h1>Reservation</h1>
                        <FontAwesomeIcon icon={faCalendarCheck} className="text-2xl"/>
                    </div>
                    <p className="keymetrics-card-content">201</p>
                    <p className="keymetrics-card-footer">increased by 15% last month</p>
                </div>
            </div>
            <div>
            </div>
        </section>
    );
}
export default KeyMetrics;