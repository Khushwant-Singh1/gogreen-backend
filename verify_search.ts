import axios from 'axios';

// Simple cookie jar implementation
let cookieJar: string[] = [];

const client = axios.create({ 
  baseURL: 'http://localhost:3001/api',
  withCredentials: true 
});

// Interceptor to save cookies
client.interceptors.response.use(response => {
  const setCookie = response.headers['set-cookie'];
  if (setCookie) {
    cookieJar = [...cookieJar, ...setCookie];
  }
  return response;
});

// Interceptor to send cookies
client.interceptors.request.use(config => {
  if (cookieJar.length > 0) {
    config.headers['Cookie'] = cookieJar.join('; ');
  }
  return config;
});

async function runVerification() {
  try {
    console.log('1. Logging in...');
    await client.post('/auth/login', {
      email: 'admin@gogreen.com',
      password: 'admin123'
    });
    console.log('Logged in.');

    console.log('2. Creating test product...');
    const createRes = await client.post('/products', {
      subcategoryId: 'dcdfa789-3221-4475-8167-932371911470', // Need a valid subcategory ID. 
      // I don't have a valid ID handy. I should fetch one first.
      name: 'VerificationSearchProduct',
      slug: 'verification-search-product',
      description: 'This is a unique searchable item for verification purposes.',
      displayOrder: '0'
    });
    // Wait, if I don't have a valid ID, this fails. I need to fetch subcategories.
  } catch (err: any) {
    if (err.response?.data?.error) {
        console.log('Error creating product:', err.response.data.error);
        if (err.response.data.error.includes('uuid')) {
            console.log('Fetching subcategories to get a valid ID...');
            try {
                const subRes = await client.get('/subcategories');
                const subIds = subRes.data.data;
                if (subIds.length > 0) {
                     console.log(`Found subcategory: ${subIds[0].id}`);
                     const createRes2 = await client.post('/products', {
                        subcategoryId: subIds[0].id,
                        name: 'VerificationSearchProduct',
                        slug: 'verification-search-product',
                        description: 'This is a unique searchable item for verification purposes.',
                        displayOrder: '0'
                     });
                     console.log('Product created:', createRes2.data.data.id);
                     await testSearch(createRes2.data.data.id);
                } else {
                    console.log('No subcategories found. Cannot create product.');
                }
            } catch (e) {
                console.error('Failed to recover:', e);
            }
        }
    } else {
        console.error('Verification failed', err.message);
    }
    return;
  }
}

async function testSearch(productId: string) {
    console.log('3. Searching for "searchable"...');
    const searchRes = await client.get('/products?search=searchable');
    const found = searchRes.data.data.find((p: any) => p.id === productId);
    
    if (found) {
        console.log('SUCCESS: Found product by description keyword.');
    } else {
        console.log('FAILURE: Product not found in search results.');
        console.log('Results:', searchRes.data.data.map((p:any) => p.name));
    }

    console.log('4. Cleaning up...');
    await client.delete(`/products/${productId}`);
    console.log('Product deleted.');
}

runVerification();
