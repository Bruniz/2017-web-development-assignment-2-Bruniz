var show = true; // Should the information be shown or not
let version, iban, amount, reference, dueDate, euros, cents; // Variables to store the information

// Function for showing correct name of button
function displayBtnTxt () {

    // If the information is shown, set the text on the button to 'hide'
    if(show === true) {
        document.getElementById("toggle").innerHTML = "Hide";
    }
    // Else set the text of the button to 'show'
    else {
        document.getElementById("toggle").innerHTML = "Show";
    }

}

// Function for handling clicks on the hide/show button
function toggleInformation() {
    show = !show; // Toggle state
    displayBtnTxt(); // Update the text to display
    $("#information").slideToggle(); // Use jQuery to toggle the information box, use id for efficiency
}
// Function for decoding the virtual bar code, displaying the information and decoding and showing the bar code
function decodeVirtualBarCode() {

    // Get the virtual bar code from the input field
    let input = document.getElementById("virtualCode").value;

    // Only process the input if present
    if(input) {

        version = input.slice(0, 1);// Extract version number
        iban = input.slice(1, 17); // Extract IBAN
        euros = input.slice(17, 23); // Extract euros
        cents = input.slice(23, 25); // Extract cents
        dueDate = input.slice(48, 55); // Extract due date
        amount = parseInt(euros, 10) + "." + cents; // Combine euros and cents to amount

        // If version 4, extract and format accordingly
        if (version == 4) {
            reference = input.slice(29, 48).replace(/^0+/, '');

            // Check length of reference, format for better readability
            if (reference.length % 5 === 0) {
                // Three number groups of five numbers
                reference = reference.slice(0, 5) + ' ' + reference.slice(5, 10) + ' ' + reference.slice(10, 15);

            } else {
                // One group pf two numbers + three groups of five numbers
                reference = reference.slice(0, 2) + ' ' + reference.slice(2, 7) + ' ' + reference.slice(7, 12) + ' ' + reference.slice(12, 17);
            }
        }
        // Else this was version 5. Extract and format accordingly.
        else {
            // Extract reference prepended with RF
            reference = 'RF' + input.slice(25, 27) + input.slice(28, 48).replace(/^0+/, '');

            // Check length of reference, format for better readability
            if (reference.length % 4 === 0) {
                // Four groups of four numbers
                reference = reference.slice(0, 4) + ' ' + reference.slice(4, 8) + ' ' + reference.slice(8, 12) + ' ' + reference.slice(12, 16);

            } else {
                // Two groups of four numbers + one group of two
                reference = reference.slice(0, 4) + ' ' + reference.slice(4, 8) + ' ' + reference.slice(8, 10);
            }
        }

        // Set the values of the IBAN, amount and reference elements in the HTML
        document.getElementById("iban").innerHTML = iban.slice(0, 2) + " " + iban.slice(2, 6) + " " +
            iban.slice(6, 10) + " " + iban.slice(10, 14) + " " + iban.slice(14, 16) + " "; // Format iban for readability
        document.getElementById("amount").innerHTML = amount
        document.getElementById("reference").innerHTML = reference;

        // If the due date is not set then display 'None'
        if (parseInt(dueDate) === 0) {
            document.getElementById("due").innerHTML = 'None';
        }
        // Else diaplay the due date
        else {
            document.getElementById("due").innerHTML = dueDate.slice(4, 6) + '.' + dueDate.slice(2, 4) + '.20' + dueDate.slice(0, 2);
        }

        // Encode the bar code and draw it to the canvas
        JsBarcode("#bar-code", input, {format: "CODE128C"});
    }
}