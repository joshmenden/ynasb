function appendLeadingZeroes (n) {
  if(n <= 9){
    return "0" + n
  }
  return n
}

export default function formattedDate () {
  let current = new Date()
  let formatted = current.getFullYear() + "-" + appendLeadingZeroes(current.getMonth() + 1) + "-" + appendLeadingZeroes(current.getDate()) + " " + appendLeadingZeroes(current.getHours()) + ":" + appendLeadingZeroes(current.getMinutes()) + ":" + appendLeadingZeroes(current.getSeconds())
  return formatted
}