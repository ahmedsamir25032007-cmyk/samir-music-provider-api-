# Samir Music Provider API

A simple music search API built with Node.js.

## Features

- Dynamic Provider Registry
- Automatic Provider Loading on Server Startup
- iTunes Music Search
- Demo Music Provider
- Search Results with Album Artwork
- Track Preview Links
- Configurable Result Limit

## Requirements

- Node.js
- Termux or any Node.js environment

## Installation

Clone the repository:

    git clone YOUR_REPOSITORY_URL

Enter the project:

    cd provider-lab

## Run

    node api-server.mjs

Server runs on port 3000.

## API Endpoints

### Health Check

    GET /health

### List Providers

    GET /providers

### Search Music

    GET /music?q=Believer

### Search with Specific Provider

    GET /music?q=Believer&provider=itunes

### Search with Result Limit

    GET /music?q=Believer&limit=2

## Available Providers

- iTunes
- Demo Music

## Technology

- JavaScript
- Node.js
- HTTP Server
- iTunes Search API

## Author

Samir
