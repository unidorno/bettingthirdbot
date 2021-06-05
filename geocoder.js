const NodeGeocoder = require('node-geocoder');
 
const options = {
  provider: 'google',
 
  // Optional depending on the providers
  fetch: customFetchImplementation,
  apiKey: 'AIzaSyBiSZeKCsZHwFotMb358IrEiYZYvBbRhhg', // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};
 
const geocoder = NodeGeocoder(options);
 
// Using callback
const res = await geocoder.geocode('проспект богенбай батыра 21а');
 
console.log(res[0])