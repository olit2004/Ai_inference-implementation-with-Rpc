
install:
	cd server && npm install
	cd client && npm install

run-server:
	cd server && npm run dev

run-client:
	cd client && $env:SERVER_ADDR="localhost:50051"; node src/grpcClient.js

test-all:
	cd client && $env:SERVER_ADDR="localhost:50051"; node src/grpcClient.js --test

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down
