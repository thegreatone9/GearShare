export const RENTAL_STATUS = {
    PENDING_LEND: 'pendingLenderAcceptance',
    ACTIVE: 'active',
    DISPUTED: 'disputed',
    COMPLETED: 'completed'
}

export const REQUEST_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed'
}

export const DISPUTE_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed'
}

export const TIME_UNIT = {
    HOUR: 'hour',
    DAY: 'day',
    MONTH: 'month'
}

export const MOCK_DATA = {
    accounts: [
        { id: 1, email: "tom@gearshare.com", password: "password", name: "Tom Hanks" },
        { id: 2, email: "jane@gearshare.com", password: "password", name: "Jane Doe" }
    ],

    listings: [
        { id: 1, ownerId: 2, title: "Cordless Drill Set", price: 15, unit: TIME_UNIT.DAY, location: "Downtown LA", rating: 4.8, replacementValue: 150, imageUrl: "https://placehold.co/300x200/4F46E5/FFFFFF?text=Drill" },

        { id: 2, ownerId: 1, title: "DJI Mavic Mini Drone", price: 35, unit: TIME_UNIT.DAY, location: "Santa Monica", rating: 4.5, replacementValue: 800, imageUrl: "https://placehold.co/300x200/10B981/FFFFFF?text=Drone" },

        { id: 3, ownerId: 2, title: "Professional Steam Iron", price: 5, unit: TIME_UNIT.DAY, location: "Venice Beach", rating: 4.9, replacementValue: 60, imageUrl: "https://placehold.co/300x200/F97316/FFFFFF?text=Iron" },

        { id: 4, ownerId: 1, title: "Fender Acoustic Guitar", price: 100, unit: TIME_UNIT.DAY, location: "Culver City", rating: 5.0, replacementValue: 450, imageUrl: "https://placehold.co/300x200/EC4899/FFFFFF?text=Guitar" },

        { id: 5, ownerId: 2, title: "Keyboard", price: 20, unit: TIME_UNIT.DAY, location: "Montana City", rating: 5.0, replacementValue: 20, imageUrl: "https://placehold.co/300x200/EC4899/FFFFFF?text=Keyboard" },

        { id: 6, ownerId: 1, title: "Camera", price: 500, unit: TIME_UNIT.DAY, location: "Vermont", rating: 5.0, replacementValue: 450, imageUrl: "https://placehold.co/300x200/EC4899/FFFFFF?text=Camera" },

        { id: 7, ownerId: 2, title: "Skateboard", price: 50, unit: TIME_UNIT.DAY, location: "Jericho", rating: 5.0, replacementValue: 30, imageUrl: "https://placehold.co/300x200/EC4899/FFFFFF?text=Skateboard" },
    ],

    requests: [
        { id: 501, listingId: 4, borrowerId: 2, lenderId: 1, date: "", rentStartDate: "", rentEndDate: "", status: REQUEST_STATUS.COMPLETED, deposit: "500" },
        { id: 502, listingId: 4, borrowerId: 2, lenderId: 1, date: "", rentStartDate: "", rentEndDate: "", status: REQUEST_STATUS.COMPLETED, deposit: null },
        { id: 503, listingId: 4, borrowerId: 2, lenderId: 1, date: "", rentStartDate: "", rentEndDate: "", status: REQUEST_STATUS.COMPLETED, deposit: "500" },
        { id: 504, listingId: 4, borrowerId: 2, lenderId: 1, date: "", rentStartDate: "", rentEndDate: "", status: REQUEST_STATUS.COMPLETED, deposit: null },
        { id: 505, listingId: 4, borrowerId: 2, lenderId: 1, date: "", rentStartDate: "", rentEndDate: "", status: REQUEST_STATUS.ACTIVE, deposit: null },
    ],

    disputes: [
        { id: 901, rentalId: 203, startDate: "", endDate: "", status: DISPUTE_STATUS.ACTIVE },
        { id: 902, rentalId: 204, startDate: "", endDate: "", status: DISPUTE_STATUS.COMPLETED },
    ],

    rentals: [
        { id: 201, listingId: 2, requestId: 501, borrowerId: 2, lenderId: 1, status: RENTAL_STATUS.ACTIVE,
            rentDate: "10/09/25", dueDate: "15/10/25", returnDate: null, disputeId: null, paidDate: null },

        { id: 202, listingId: 2, requestId: 501, borrowerId: 2, lenderId: 1, status: RENTAL_STATUS.ACTIVE,
            rentDate: "10/09/25", dueDate: "15/10/25", returnDate: null, disputeId: null, paidDate: null },

        { id: 203, listingId: 2, requestId: 503, borrowerId: 2, lenderId: 1, status: RENTAL_STATUS.DISPUTED,
            rentDate: "10/09/25", dueDate: "15/10/25", returnDate: "17/10/25", disputeId: 901, paidDate: null },

        { id: 204, listingId: 2, requestId: 504, borrowerId: 2, lenderId: 1, status: RENTAL_STATUS.COMPLETED,
            rentDate: "10/09/25", dueDate: "15/10/25", returnDate: "16/10/25", disputeId: 902, paidDate: "18/10/25" },

        { id: 205, listingId: 2, requestId: 504, borrowerId: 2, lenderId: 1, status: RENTAL_STATUS.COMPLETED,
            rentDate: "10/09/25", dueDate: "15/10/25", returnDate: "14/10/25", disputeId: null, paidDate: "14/10/25" }
    ]
};