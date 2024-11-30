
document.addEventListener('DOMContentLoaded', function() {

    // Toggle menu for the Header
    var toggleMenuHeader = document.getElementById('toggle-menu-header');
    if (toggleMenuHeader) {
        toggleMenuHeader.addEventListener('click', function() {
            var rowHeader = document.querySelector('.toggle-receiver-header');
            var header = document.querySelector('header');

            if (rowHeader.classList.contains('header-mobile-row-invisible')) {
                rowHeader.classList.remove('header-mobile-row-invisible');
                rowHeader.classList.add('header-mobile-row');
                header.classList.add('header-full-page');
            } else if (rowHeader.classList.contains('header-mobile-row')) {
                rowHeader.classList.remove('header-mobile-row');
                rowHeader.classList.add('header-mobile-row-invisible');
                header.classList.remove('header-full-page');
            }
        });
    }
});