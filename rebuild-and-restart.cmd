@echo off
echo Building and restarting TeleMedix Docker containers...

:: Build frontend
echo Building frontend...
cd frontend
npm run build
cd ..

:: Stop existing containers
echo Stopping existing containers...
docker-compose down

:: Rebuild images
echo Rebuilding Docker images...
docker-compose build

:: Start services
echo Starting services...
docker-compose up -d

:: Wait for backend and DB to start
echo Waiting for services to start...
timeout /t 5 /nobreak > nul

:: Run database migrations to ensure tables exist
echo Running database migrations...
docker-compose exec backend npx prisma migrate deploy

echo Done! Services are now running.
echo - Frontend: http://localhost
echo - Backend API: http://localhost:3000/api 