$(document).ready(function () {
    var jsonData;
    var accountManagerSales = {};
    var itemsPerPage = 10;
    var currentPage = 1;
    var filteredData = []; // Store the filtered data
  
    // Function to populate the table with JSON data
    function populateTable(data, page) {
      var tableBody = $('#data-table tbody');
      tableBody.empty();
  
      // Calculate the start and end indices for the current page
      var startIndex = (page - 1) * itemsPerPage;
      var endIndex = startIndex + itemsPerPage;
  
      // Loop through the data and create table rows for the current page
      for (var i = startIndex; i < endIndex && i < data.length; i++) {
        var item = data[i];
        var row = $('<tr>');
        // Added table data (columns) here based on my JSON structure
        row.append($('<td class="text-sm">').text(item.id));
        row.append($('<td class="text-sm">').text(item.bp_code));
        row.append($('<td class="text-sm">').text(item.bp_name));
        row.append($('<td class="text-sm">').text(item.district));
        row.append($('<td class="text-sm">').text(item.profile));
        row.append($('<td class="text-sm">').text(item.sector));
        row.append($('<td class="text-sm">').text(item.customer_category));
        row.append($('<td class="text-sm">').text(item.supplier));
        row.append($('<td class="text-sm">').text(item.product));
        row.append($('<td class="text-sm">').text(item.item_description));
        row.append($('<td class="text-sm">').text(item.qty));
        row.append($('<td class="text-sm">').text(item.price));
  
        var totalSales = item.qty * item.price;
        row.append($('<td class="text-sm">').text(totalSales));
  
        // Reorder the columns to display correctly
        row.append($('<td class="text-sm">').text(item.sales_month));
        row.append($('<td class="text-sm">').text(item.end_date));
  
        var endDate = new Date(item.end_date);
        var currentDate = new Date();
        var timeDiff = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
        row.append($('<td class="text-sm">').text(timeDiff));
        var statusSpan = $('<span>');
        var contractStatus;
        if (timeDiff <= 0) {
          contractStatus = 'Expired';
          statusSpan.addClass('status-btn close-btn');
        } else if (timeDiff < 30) {
          contractStatus = 'Expires < 30 days';
            statusSpan.addClass('status-btn warning-btn');
        } else if (timeDiff < 60) {
          contractStatus = 'Expires < 60 days';
            statusSpan.addClass('status-btn warning-btn');
        } else {
          contractStatus = 'Valid Contract';
            statusSpan.addClass('status-btn success-btn');
        }
        

        // Add the classes "status-btn" and "close-btn" to the span
       

        // Set the text content of the span to the contractStatus variable
        statusSpan.text(contractStatus);

        // Create a new table data (td) element
        var tdElement = $('<td class="text-sm">');

        // Append the statusSpan to the tdElement
        tdElement.append(statusSpan);

        // Now, you can use the tdElement wherever you need it (e.g., append it to a row or table).
        // For example, if you want to append it to a row:
        row.append(tdElement);
  
        row.append($('<td class="text-sm">').text(item.account_manager));
  
        tableBody.append(row);
      }
    }
  
    // Function to update the pagination buttons
    function updatePaginationButtons() {
      var totalPages = Math.ceil(filteredData.length / itemsPerPage);
      var paginationButtons = $('#pagination-buttons');
      paginationButtons.empty();
      // Add Previous button if not on the first page
      if (currentPage > 1) {
        var prevButton = $('<button class="main-btn2 primary-btn btn-hover">').text('Previous');
        prevButton.on('click', function () {
          currentPage--;
          populateTable(filteredData, currentPage);
          updatePaginationButtons();
        });
        paginationButtons.append(prevButton);
      }
  
      for (var i = 1; i <= totalPages; i++) {
        var button = $('<button class="main-btn2 primary-btn btn-hover">').text(i);
        if (i === currentPage) {
          button.addClass('active');
        } else {
          button.on('click', function () {
            currentPage = parseInt($(this).text(), 10);
            populateTable(filteredData, currentPage);
            updatePaginationButtons();
          });
        }
        paginationButtons.append(button);
      }
  
      // Add Next button if not on the last page
      if (currentPage < totalPages) {
        var nextButton = $('<button class="main-btn2 primary-btn btn-hover">').text('Next');
        nextButton.on('click', function () {
          currentPage++;
          populateTable(filteredData, currentPage);
          updatePaginationButtons();
        });
        paginationButtons.append(nextButton);
      }
    }
  
    // Function to load JSON data using AJAX
    function loadJSONData(filePath) {
      $.ajax({
        url: filePath,
        dataType: 'json',
        success: function (data) {
          jsonData = data;
          filteredData = data; // Initialize filteredData with all data initially
          populateTable(data, currentPage);
          calculateAccountManagerSales();
          updatePaginationButtons();
        },
        error: function () {
          console.error('Error loading JSON data');
        },
      });
    }
  
    // Function to calculate total sales for each account manager based on the filtered data
    function calculateAccountManagerSales() {
      accountManagerSales = {};
  
      filteredData.forEach(function (item) {
        var salesMonth = item.sales_month.trim();
        var accountManager = item.account_manager;
        var totalSales = item.qty * item.price;
  
        if (!accountManagerSales[accountManager]) {
          accountManagerSales[accountManager] = {
            totalSales: 0,
            products: {},
            months: {},
          };
        }
  
        if (!accountManagerSales[accountManager].products[item.product]) {
          accountManagerSales[accountManager].products[item.product] = 0;
        }
  
        if (!accountManagerSales[accountManager].months[salesMonth]) {
          accountManagerSales[accountManager].months[salesMonth] = 0;
        }
  
        accountManagerSales[accountManager].totalSales += totalSales;
        accountManagerSales[accountManager].products[item.product] += totalSales;
        accountManagerSales[accountManager].months[salesMonth] += totalSales;
      });
  
      console.log(accountManagerSales); // Display the accountManagerSales object in the console
  
      // Update the chart after calculating account manager sales
      updateChart(filteredData);
    }
  
    // Function to filter the table based on the selected filters
    function filterTable() {
      var salesMonth = $('#sales-month-filter').val();
      var accountManager = $('#account-manager-filter').val();
      var profile = $('#profile-filter').val();
      var product = $('#product-filter').val();
      var customerCategory = $('#customer-category-filter').val();
      var sector = $('#sector-filter').val();
  
      filteredData = jsonData.filter(function (item) {
        return (
          (salesMonth === '' || item.sales_month.toLowerCase().includes(salesMonth.toLowerCase())) &&
          (accountManager === '' || item.account_manager.toLowerCase().includes(accountManager.toLowerCase())) &&
          (profile === '' || item.profile.toLowerCase().includes(profile.toLowerCase())) &&
          (product === '' || item.product.toLowerCase().includes(product.toLowerCase())) &&
          (customerCategory === '' || item.customer_category.toLowerCase().includes(customerCategory.toLowerCase())) &&
          (sector === '' || item.sector.toLowerCase().includes(sector.toLowerCase()))
        );
      });
  
      currentPage = 1; // Reset currentPage to 1 after filtering
      updatePaginationButtons();
      populateTable(filteredData, currentPage); // Update the table with the filtered data
      calculateAccountManagerSales();
      updateChart(filteredData); // Pass the filtered data to the updateChart function
    }
  
    function updateChart(data) {
        var salesMonthFilter = $('#sales-month-filter').val();
        var accountManagerFilter = $('#account-manager-filter').val();
        var profileFilter = $('#profile-filter').val();
        var productFilter = $('#product-filter').val();
        var customerCategoryFilter = $('#customer-category-filter').val();
        var sectorFilter = $('#sector-filter').val();
    
        // Filter the JSON data based on the selected filters
        var filteredData = jsonData.filter(function (item) {
          return (
            (salesMonthFilter === '' || item.sales_month.toLowerCase().includes(salesMonthFilter.toLowerCase())) &&
            (accountManagerFilter === '' || item.account_manager.toLowerCase().includes(accountManagerFilter.toLowerCase())) &&
            (profileFilter === '' || item.profile.toLowerCase().includes(profileFilter.toLowerCase())) &&
            (productFilter === '' || item.product.toLowerCase().includes(productFilter.toLowerCase())) &&
            (customerCategoryFilter === '' || item.customer_category.toLowerCase().includes(customerCategoryFilter.toLowerCase())) &&
            (sectorFilter === '' || item.sector.toLowerCase().includes(sectorFilter.toLowerCase()))
          );
        });
    
        // Process the data to get total sales for each month
        var monthlySales = {
          January: 0,
          February: 0,
          March: 0,
          April: 0,
          May: 0,
          June: 0,
          July: 0,
          August: 0,
          September: 0,
          October: 0,
          November: 0,
          December: 0,
        };
    
        filteredData.forEach(function (item) {
          var salesMonth = item.sales_month.trim();
          monthlySales[salesMonth] += item.qty * item.price;
        });
    
        // Get the chart canvas and update the chart data
        chart4.data.datasets[0].data = Object.values(monthlySales);
        chart4.data.datasets[1].data = Object.values(monthlySales);
        // Update the chart
        chart4.update();
    }
  
    // Function to filter the table based on the search keyword
  function searchTable() {
    var searchKeyword = $('#search-input').val().toLowerCase();

    // Filter the jsonData based on the search keyword
    filteredData = jsonData.filter(function (item) {
      // Modify the properties you want to search on (e.g., item.district, item.profile, etc.)
      return (
        item.district.toLowerCase().includes(searchKeyword) ||
        item.bp_name.toLowerCase().includes(searchKeyword) ||
        item.bp_code.toLowerCase().includes(searchKeyword) ||
        item.supplier.toLowerCase().includes(searchKeyword) ||
        item.product.toLowerCase().includes(searchKeyword) ||
        item.item_description.toLowerCase().includes(searchKeyword) ||
        item.profile.toLowerCase().includes(searchKeyword) ||
        item.customer_category.toLowerCase().includes(searchKeyword) ||
        item.sector.toLowerCase().includes(searchKeyword) ||
        item.sales_month.toLowerCase().includes(searchKeyword) ||
        item.account_manager.toLowerCase().includes(searchKeyword)
      );
    });

    currentPage = 1; // Reset currentPage to 1 after filtering
    updatePaginationButtons();
    populateTable(filteredData, currentPage); // Update the table with the filtered data
    calculateAccountManagerSales();
    updateChart(filteredData); // Pass the filtered data to the updateChart function
  }

  // Example usage of an input event listener for the search input field
  $('#search-input').on('input', function () {
    searchTable();
  });

    // Example usage of a filter event listener for a dropdown
    $('.select-style-1 select').on('change', function () {
      filterTable();
    });
  
    // Called the function and pass the JSON file path here
    loadJSONData('data.json');
  });
  