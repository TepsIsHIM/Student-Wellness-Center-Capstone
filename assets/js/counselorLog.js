
function toggleRow(rowId) {
    const hiddenRow = document.getElementById(rowId);
    if (hiddenRow.classList.contains('open')) {
      hiddenRow.classList.remove('open');
    } else {
      const allHiddenRows = document.querySelectorAll('.hidden-row');
      allHiddenRows.forEach(row => row.classList.remove('open'));
      hiddenRow.classList.add('open');
    }
  }

  function toggleRow(rowId) {
    const hiddenRow = document.getElementById(rowId);
    hiddenRow.style.display = (hiddenRow.style.display === "table-row") ? "none" : "table-row";
}