const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000; // You can change this port if needed

app.use(express.json());
app.use(express.static('public')); // Assuming your frontend files are in a folder named 'public'

async function fetchUniSwapData() {
    const query = `{
        factories(first: 5) {
            id
            poolCount
            txCount
            totalVolumeUSD
        }
        bundles(first: 5) {
            id
            ethPriceUSD
        }
        uniswapDayDatas(first: 10) {
            date
            feesUSD
            tvlUSD
            txCount
            volumeETH
            volumeUSD
            volumeUSDUntracked
        }
    }`;

    try {
        const response = await axios.post('https://gateway.thegraph.com/api/538b3d42110c292f2bb83a3d0143dc4a/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV', { query });
        return response.data.data.uniswapDayDatas;
    } catch (error) {
        console.error('Error fetching UniSwap data:', error);
        return [];
    }
}

async function fetchLlamaInsights(data) {
    const dataString = data
        .map(d => `On ${d.date} ${d.feesUSD} ${d.tvlUSD} ${d.volumeETH} ${d.txCount} ${d.volumeUSDUntracked} ${d.volumeUSD}`)
        .join('\n');

    const prompt = `Here's the data from UniSwap: ${dataString}. What can you tell me about this?`;
    
    try {
        const response = await axios.post('https://llama.us.gaianet.network/v1/chat/completions', {
            model: 'llama',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that analyzes Uniswap data and provides insights' },
                { role: 'user', content: prompt }
            ]
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching Llama Insights', error);
        return 'An error occurred while fetching insights.';
    }
}

app.post('/api/chat', async (req, res) => {
    const data = await fetchUniSwapData();
    const insights = await fetchLlamaInsights(data);
    res.json({ reply: insights });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
