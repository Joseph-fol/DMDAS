const initializeTransaction = async (req, res) => {
    const payStackBaseURL = "https://api.paystack.co";
    const { email, fullName, matricNumber } = req.user; // Get user info from the verified token
    const { amount, courseCode } = req.body;

    if (!amount || !courseCode) {
        return res.status(400).json({ message: "Amount and courseCode are required." });
    }

    try {
        // Initialize a transaction on Paystack
        const transactionResponse = await fetch(`${payStackBaseURL}/transaction/initialize`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                amount: amount * 100, // Paystack amount is in kobo
                metadata: {
                    fullName: fullName,
                    matricNumber: matricNumber,
                    courseCode: courseCode,
                },
            }),
        });

        const transactionData = await transactionResponse.json();

        if (!transactionResponse.ok || !transactionData.status || !transactionData.data.reference) {
            console.error("Paystack Error initializing transaction:", transactionData);
            return res.status(transactionResponse.status).json({ message: "Failed to initialize transaction.", details: transactionData.message });
        }

        // Create a new transaction record in your database
        const newTransaction = new Transaction({
            user: req.user._id,
            matricNumber: matricNumber,
            amount: amount,
            courseCode: courseCode,
            reference: transactionData.data.reference,
            status: 'pending',
        });

        await newTransaction.save();
        console.log(`Transaction pending for ${matricNumber} with reference ${transactionData.data.reference}`);

        return res.status(200).json(transactionData);
    } catch (error) {
        console.error("Error during transaction initialization:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const verifyTransaction = async (req, res) => {
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
        console.error("Webhook Error: Invalid signature");
        return res.sendStatus(400); // Invalid signature
    }

    const event = req.body;

    // Check for a successful charge event
    if (event.event === 'charge.success') {
        const reference = event.data.reference;

        try {
            // Find the transaction in your database
            const transaction = await Transaction.findOne({ reference: reference });
            if (!transaction) {
                console.error(`Webhook Error: Transaction with reference ${reference} not found.`);
                return res.sendStatus(404);
            }

            // Verify the transaction status with Paystack
            const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            });

            const verificationData = await verifyResponse.json();

            if (verificationData.data && verificationData.data.status === 'success') {
                // Update transaction status to 'successful'
                transaction.status = 'successful';
                await transaction.save();

                console.log(`Transaction ${reference} successfully verified and updated.`);
            } else {
                console.warn(`Webhook Warning: Transaction ${reference} verification failed or status not 'success'.`);
            }
        } catch (error) {
            console.error(`Webhook Error processing reference ${reference}:`, error);
            return res.sendStatus(500);
        }
    }

    // Acknowledge receipt of the event
    res.sendStatus(200);
};

module.exports = { initializeTransaction, verifyTransaction }