import './css/style.css'
import App from './app'

// Mount app
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = ''
    root.appendChild(App())
  }
})
