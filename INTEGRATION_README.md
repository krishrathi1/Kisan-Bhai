# 🚀 NCDEX Market Integration for BeejMantra

## Overview
This integration brings real-time NCDEX market data scraping and visualization to the BeejMantra project, allowing farmers to view live crop prices, set price alerts, and analyze market trends.

## ✨ New Features Added

### 1. **Live Market Prices** 📊
- Real-time scraping of NCDEX commodity prices
- Interactive charts (Line, Bar, Pie) for price visualization
- Filter by commodity and location
- Search functionality for easy navigation
- Auto-refresh capability

### 2. **Price Alerts** 🔔
- Set custom price alerts for specific crops
- Choose "above" or "below" price conditions
- Get notified when prices reach target levels
- Manage multiple alerts with enable/disable toggle
- Persistent storage using localStorage

### 3. **Enhanced Market Analysis** 🤖
- AI-powered market analysis (existing feature)
- Voice input support for queries
- Text-to-speech for analysis results
- Integration with live price data

## 🛠️ Technical Implementation

### API Endpoint
- **Route**: `/api/market-prices`
- **Method**: GET
- **Function**: Scrapes NCDEX live spot market data
- **Technology**: Puppeteer for web scraping

### Components Created
1. **`MarketPrices`** - Main price display and charting
2. **`PriceAlerts`** - Alert management system
3. **Updated `MarketAnalystClient`** - Tabbed interface

### Dependencies Added
- `puppeteer` - Web scraping
- `json2csv` - Data export support
- `recharts` - Chart visualization (already present)

## 🚀 How to Run

### 1. Install Dependencies
```bash
cd beejMantra/BeejMantra
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access Market Features
Navigate to: `http://localhost:9002/dashboard/market-analyst`

## 📱 User Interface

### Tab 1: AI Analysis
- Ask market questions using text or voice
- Get AI-powered market insights
- Listen to analysis results

### Tab 2: Live Prices
- View real-time commodity prices
- Switch between chart types
- Filter and search commodities
- Refresh data manually

### Tab 3: Price Alerts
- Create price alerts for crops
- Set target prices and conditions
- Monitor alert status
- Get notifications when triggered

## 🔧 Configuration

### Environment Variables
No additional environment variables required. The scraper uses default Puppeteer settings.

### Browser Requirements
- Chrome or Edge browser installed
- Puppeteer will auto-download required drivers

## 📊 Data Sources

### NCDEX Live Spot Market
- **URL**: https://www.ncdex.com/markets/livespot
- **Data**: Commodity, Location, Price, Change, Time
- **Update Frequency**: Manual refresh (can be automated)

### Supported Commodities
- Wheat, Rice, Maize, Pulses
- Oilseeds, Spices, Cotton
- And more based on NCDEX availability

## 🎯 Use Cases

### For Farmers
1. **Price Monitoring**: Track crop prices in real-time
2. **Market Timing**: Know when to sell for best prices
3. **Crop Planning**: Choose crops based on current market trends
4. **Price Alerts**: Get notified of favorable price movements

### For Traders
1. **Market Analysis**: Visualize price trends
2. **Data Export**: Access structured market data
3. **Historical Comparison**: Track price changes over time

## 🔒 Security & Performance

### Security
- No sensitive data collection
- Local storage for user preferences
- Secure API endpoints

### Performance
- Efficient data scraping with Puppeteer
- Optimized chart rendering
- Minimal API calls with caching

## 🚧 Troubleshooting

### Common Issues

1. **Scraping Fails**
   - Check internet connection
   - Verify NCDEX website accessibility
   - Ensure Chrome/Edge is installed

2. **Charts Not Loading**
   - Check browser console for errors
   - Verify recharts dependency is installed
   - Clear browser cache

3. **Price Alerts Not Working**
   - Check localStorage permissions
   - Verify alert creation process
   - Test with manual price checks

### Debug Mode
Enable console logging for detailed error information:
```javascript
// In browser console
localStorage.setItem('debug', 'true')
```

## 🔮 Future Enhancements

### Planned Features
1. **Automated Scraping**: Scheduled price updates
2. **Historical Data**: Price history and trends
3. **Export Options**: CSV, PDF reports
4. **Mobile App**: Native mobile support
5. **Push Notifications**: Real-time price alerts

### API Improvements
1. **Rate Limiting**: Prevent excessive scraping
2. **Data Caching**: Reduce API calls
3. **Error Handling**: Better error recovery
4. **Monitoring**: Scraping success metrics

## 📝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Test thoroughly
5. Submit pull request

### Code Standards
- TypeScript for type safety
- React hooks for state management
- Tailwind CSS for styling
- Component-based architecture

## 📄 License

This integration follows the same license as the main BeejMantra project.

## 🤝 Support

For issues or questions:
1. Check troubleshooting section
2. Review console errors
3. Create GitHub issue with details
4. Include browser and OS information

---

**Happy Farming! 🌾📈**
