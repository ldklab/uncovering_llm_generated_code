<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tooltip with Popper.js</title>
  <style>
    #tooltip {
      background-color: #333;
      color: #fff;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 13px;
      position: absolute;
      z-index: 1000;
      max-width: 200px;
    }
  </style>
</head>
<body>

  <button id="button" aria-describedby="tooltip">Hover over me!</button>
  <div id="tooltip" role="tooltip" style="display: none;">Hello, I'm a tooltip!</div>

  <script src="https://unpkg.com/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const button = document.querySelector('#button');
      const tooltip = document.querySelector('#tooltip');

      let popperInstance = null;

      const createPopperInstance = () => {
        popperInstance = Popper.createPopper(button, tooltip, {
          placement: 'right',
        });
      };

      const showTooltip = () => {
        tooltip.style.display = 'block';
        createPopperInstance();
      };

      const hideTooltip = () => {
        tooltip.style.display = 'none';
        if (popperInstance) {
          popperInstance.destroy();
          popperInstance = null;
        }
      };

      button.addEventListener('mouseenter', showTooltip);
      button.addEventListener('mouseleave', hideTooltip);
    });
  </script>

</body>
</html>
