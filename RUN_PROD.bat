@echo off
echo Starting FTA PROD Backend at port 8081...
cd /d %~dp0\backend
java -jar target\backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
pause
