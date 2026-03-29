import axios from 'axios';

async function testRegister() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Debug User',
            email: 'debug@example.com',
            password: 'Password123!',
            country: 'US',
            companyName: 'Debug Corp'
        });
        console.log('Success:', response.data);
    } catch (error: any) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testRegister();
