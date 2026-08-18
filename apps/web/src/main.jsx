import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
	<App />
);

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js?v=2`).catch(() => {});
}