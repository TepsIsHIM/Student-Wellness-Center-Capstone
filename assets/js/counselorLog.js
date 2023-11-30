
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
function filterTable(column, value) {
  var rows = document.getElementById("TableID").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
  for (var i = 0; i < rows.length; i++) {
      var currentRow = rows[i].getElementsByTagName("td")[column];
      if (currentRow) {
          var textValue = currentRow.textContent || currentRow.innerText;
          if (textValue.indexOf(value) > -1) {
              rows[i].style.display = "";
          } else {
              rows[i].style.display = "none";
          }
      }
  }
}