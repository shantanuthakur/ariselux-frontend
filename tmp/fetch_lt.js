import https from 'https';

https.get('https://www.lightingtowers.in/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Fetched length:', data.length);
    // Find image tags or product sections
    const matches = data.match(/<img[^>]+>/g) || [];
    console.log('Images found:', matches.slice(0, 15));
    // Search for prodlight or similar class
    const classMatches = data.match(/class="[^"]*(?:tower|prod|light|hero)[^"]*"/gi) || [];
    console.log('Classes found:', classMatches.slice(0, 20));
  });
}).on('error', err => console.error(err));
