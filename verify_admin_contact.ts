import axios from 'axios';

let cookieJar: string[] = [];

const client = axios.create({ 
  baseURL: 'http://localhost:3001/api',
  withCredentials: true 
});

client.interceptors.response.use(response => {
  const setCookie = response.headers['set-cookie'];
  if (setCookie) {
    cookieJar = [...cookieJar, ...setCookie];
  }
  return response;
});

client.interceptors.request.use(config => {
  if (cookieJar.length > 0) {
    config.headers['Cookie'] = cookieJar.join('; ');
  }
  return config;
});

async function verifyAdminContact() {
    try {
        console.log('1. Logging in as Admin...');
        await client.post('/auth/login', {
            email: 'admin@gogreen.com',
            password: 'admin123'
        });
        console.log('Logged in.');

        console.log('2. Fetching Contact Submissions...');
        const res = await client.get('/contact');
        
        console.log(`Found ${res.data.length} submissions.`);
        const submission = res.data.find((s: any) => s.email === 'verify@example.com');
        
        if (submission) {
            console.log('SUCCESS: Verified submission found in Admin API.');
            console.log('Submission:', submission);
            
            console.log('3. Deleting submission...');
            await client.delete(`/contact/${submission.id}`);
            console.log('Submission deleted.');
        } else {
            console.error('FAILURE: Verified submission NOT found in list.');
            console.log('List:', res.data);
        }

    } catch (err: any) {
        console.error('Verification Failed:', err.response?.data || err.message);
    }
}

verifyAdminContact();
