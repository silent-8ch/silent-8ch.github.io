document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('certificate-form');
    const certificateContainer = document.getElementById('certificate-container');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const swimmerName = document.getElementById('swimmer-name').value;
        const year = document.getElementById('year').value;

        generateCertificate(swimmerName, year);
    });

    function generateCertificate(name, year) {
        certificateContainer.innerHTML = `
            <div class="certificate">
                <h1>Swim Team Certificate</h1>
                <p>This certifies that</p>
                <h2>${name}</h2>
                <p>has completed the swim season in ${year}.</p>
                <p>Congratulations!</p>
            </div>
        `;
    }

    document.getElementById('print-button').addEventListener('click', function() {
        window.print();
    });
});