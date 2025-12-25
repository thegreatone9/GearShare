import listingsWithAvailability from "../server/listingsWithAvailability.js";
import checkAvailability from "../server/checkAvailability.js";
import confirmRental from "../server/confirmRental.js";
import declineRentalRequest from "../server/declineRentalRequest.js";
import deleteListingWithRequests from "../server/deleteListingWithRequests.js";
import requestItem from "../server/requestItem.js";
import payDamages from "../server/payDamages.js";
import resolveDispute from "../server/resolveDispute.js";
import transactions from "../server/transactions.js";
import returnItemCreateDispute from "../server/returnItemCreateDispute.js";
import upsertListing from "../server/upsertListing.js";

export default async function handler(req, res) {
    // 2. extract the path from the URL
    // e.g., if url is "/api/listingsWithAvailability?id=1", path is "listingsWithAvailability"
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname.replace('/api/', '');

    // 3. Route the request manually
    switch (pathname) {
        case 'checkAvailability':
            return checkAvailability(req, res);

        case 'confirmRental':
            return confirmRental(req, res);

        case 'declineRentalRequest':
            return declineRentalRequest(req, res);

        case 'deleteListingWithRequests':
            return deleteListingWithRequests(req, res);

        case 'listingsWithAvailability':
            return listingsWithAvailability(req, res);

        case 'payDamages':
            return payDamages(req, res);

        case 'requestItem':
            return requestItem(req, res);

        case 'resolveDispute':
            return resolveDispute(req, res);

        case 'returnItemCreateDispute':
            return returnItemCreateDispute(req, res);

        case 'transactions':
            return transactions(req, res);

        case 'upsertListing':
            return upsertListing(req, res);

        default:
            return res.status(404).json({ error: `Endpoint ${pathname} not found` });
    }
}