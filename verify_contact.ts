import axios from 'axios';

async function verifyContactForm() {
    try {
        console.log('1. Submitting Contact Form...');
        const res = await axios.post('http://localhost:3001/api/contact', {
            firstName: 'Verification',
            lastName: 'User',
            email: 'verify@example.com',
            phone: '1234567890',
            message: 'This is a verification message.'
        });
        console.log('Submission Result:', res.data);

        if (res.data.success) {
            console.log('SUCCESS: Form submitted.');
        } else {
            console.error('FAILURE: Form submission returned success=false');
        }

    } catch (err: any) {
        console.error('Verification Failed:', err.response?.data || err.message);
    }
}

verifyContactForm();
