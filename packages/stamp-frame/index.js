
document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault()
  window.location.href = window.location.origin + '/stamp.html?tx=' + e.target.tx.value
})