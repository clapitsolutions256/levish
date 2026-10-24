export function flyProductToCart(from: HTMLElement, image: string) {
  const cart = document.querySelector<HTMLElement>('button[aria-label="Cart"]');
  if (!cart || !image) return;
  const cartBox = cart.getBoundingClientRect();
  if (cartBox.width === 0) return;

  const fromBox = from.getBoundingClientRect();
  const size = Math.round(Math.min(168, Math.max(112, fromBox.width * 0.5)));
  const startX = fromBox.left + fromBox.width / 2 - size / 2;
  const startY = fromBox.top + fromBox.height / 2 - size / 2;
  const endX = cartBox.left + cartBox.width / 2 - (startX + size / 2);
  const endY = cartBox.top + cartBox.height / 2 - (startY + size / 2);
  const lift = Math.min(90, Math.max(36, Math.abs(endY) * 0.18));

  const flyer = document.createElement("img");
  flyer.src = image;
  flyer.alt = "";
  flyer.style.position = "fixed";
  flyer.style.zIndex = "90";
  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  flyer.style.width = `${size}px`;
  flyer.style.height = `${size}px`;
  flyer.style.objectFit = "cover";
  flyer.style.borderRadius = "22px";
  flyer.style.pointerEvents = "none";
  flyer.style.boxShadow = "0 16px 32px rgba(74, 20, 42, 0.22)";
  flyer.style.willChange = "transform, opacity";
  document.body.appendChild(flyer);

  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    flyer.remove();
    window.dispatchEvent(new Event("empulse-cart-pop"));
  };

  const bendX = endX * 0.15;
  const bendY = endY * 0.4 - lift * 0.35;
  const steps = 20;
  const frames = Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const remain = 1 - t;
    const x = remain * remain * 0 + 2 * remain * t * bendX + t * t * endX;
    const y = remain * remain * 0 + 2 * remain * t * bendY + t * t * endY;
    const opacity = t < 0.86 ? 1 : 1 - ((t - 0.86) / 0.14) * 0.75;
    return {
      transform: `translate3d(${x}px, ${y}px, 0) scale(${1 - t * 0.86})`,
      opacity,
      offset: t,
    };
  });

  const animation = flyer.animate(frames, { duration: 760, easing: "linear", fill: "forwards" });

  animation.onfinish = done;
  window.setTimeout(done, 1100);
}
