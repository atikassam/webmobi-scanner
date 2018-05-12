cd mobile/scanner
npm i
ionic cordova build android
cd ../../

cd server
npm i
npm run build
cd ../

cd WebappSDK
npm i
npm run build
cd ../

mkdir -p server/dist/public/app
cp -v 'mobile\scanner\platforms\android\app\build\outputs\apk\debug\app-debug.apk' './server/dist/public/app/app.apk'

mkdir -p server/dist/public/lib
cp -v 'WebappSDK/dist/webmobi.js' './server/dist/public/lib/webmobi.js'

cd server
npm start
