<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Popper Tooltip Example</title>
  <style>
    #tooltip {
      background-color: #333;
      color: #fff;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 13px;
      position: absolute;
      z-index: 1000;
      display: none;
      max-width: 200px;
    }
  </style>
</head>
<body>

  <button id="button" aria-describedby="tooltip">I'm a button</button>
  <div id="tooltip" role="tooltip">I'm a tooltip</div>

  <script src="https://unpkg.com/@popperjs/core@2"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const button = document.querySelector('#button');
      const tooltip = document.querySelector('#tooltip');
      let popperInstance = null;

      const initializePopper = () => {
        popperInstance = Popper.createPopper(button, tooltip, {
          placement: 'right',
        });
      };

      const showTooltip = () => {
        tooltip.style.display = 'block';
        initializePopper();
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
