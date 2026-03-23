import listingsWithAvailability from "../server/handlers/listingsWithAvailability.js";
import checkAvailability from "../server/handlers/checkAvailability.js";
import confirmRental from "../server/handlers/confirmRental.js";
import declineRentalRequest from "../server/handlers/declineRentalRequest.js";
import deleteListingWithRequests from "../server/handlers/deleteListingWithRequests.js";
import requestItem from "../server/handlers/requestItem.js";
import payDamages from "../server/handlers/payDamages.js";
import resolveDispute from "../server/handlers/resolveDispute.js";
import transactions from "../server/handlers/transactions.js";
import returnItemCreateDispute from "../server/handlers/returnItemCreateDispute.js";
import upsertListing from "../server/handlers/upsertListing.js";
import purchaseItem from "../server/handlers/purchaseItem.js";

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

        case 'purchaseItem':
            return purchaseItem(req, res);

        default:
            return res.status(404).json({ error: `Endpoint ${pathname} not found` });
    }
}