import {useMemo} from "react";
import {DISPUTE_STATUS, RENTAL_STATUS} from "../util/Util.js";

export function useBorrowerDashboardDataHook(borrowerRentals, disputes) {
    return useMemo(() => {
        const findDispute = (rental) => disputes?.find((d) => d.rental_id === rental.id);

        const activeRentals = [];
        const disputedRentals = [];
        const pastRentals = [];

        borrowerRentals?.forEach((rental) => {
            const dispute = findDispute(rental);

            if (rental.status === RENTAL_STATUS.ACTIVE) {
                activeRentals.push(rental);

            } else if (rental.status === RENTAL_STATUS.COMPLETED) {
                if (dispute && dispute.status !== DISPUTE_STATUS.COMPLETED) {
                    disputedRentals.push(rental);

                } else {
                    pastRentals.push(rental);
                }
            }
        });

        return { activeRentals, disputedRentals, pastRentals };

    }, [borrowerRentals, disputes]);
}