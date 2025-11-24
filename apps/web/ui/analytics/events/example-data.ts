const common = {
  ip: "0.0.0.0",
  referer: "(direct)",
  qr: 0,
  device: "Desktop",
  browser: "Chrome",
  os: "Mac OS",
};

const checkoutLink = {
  id: "1",
  domain: "chko.sh",
  key: "uxUrVCz",
  shortLink: "https://chko.sh/uxUrVCz",
  url: "https://checkout.dev/",
};

const docsLink = {
  id: "3",
  domain: "chko.sh",
  key: "9XyzIho",
  shortLink: "https://chko.sh/9XyzIho",
  url: "https://checkout.dev/docs",
};

const alex = {
  name: "Alex Chen",
  email: "alex@checkout.dev",
  avatar: "https://avatar.vercel.sh/a.png?text=A",
};

const jordan = {
  name: "Jordan Smith",
  email: "jordan@checkout.dev",
  avatar: "https://avatar.vercel.sh/j.png?text=J",
};

const morgan = {
  name: "Morgan Lee",
  email: "morgan@checkout.dev",
  avatar: "https://avatar.vercel.sh/m.png?text=M",
};

export const EXAMPLE_EVENTS_DATA = {
  clicks: [
    {
      event: "click",
      timestamp: new Date().toISOString(),
      click: {
        id: "1",
        country: "US",
        city: "San Francisco",
        region: "US-CA",
        continent: "NA",
        ...common,
      },
      link: checkoutLink,
    },
    {
      event: "click",
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      click: {
        id: "2",
        country: "US",
        city: "New York",
        region: "US-NY",
        continent: "NA",
        ...common,
      },
      link: checkoutLink,
    },
    {
      event: "click",
      timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
      click: {
        id: "3",
        country: "US",
        city: "Pittsburgh",
        region: "US-PA",
        continent: "NA",
        ...common,
      },
      link: docsLink,
    },
  ],
  leads: [
    {
      event: "lead",
      timestamp: new Date().toISOString(),
      eventId: "YbL8RwLTRRCxQz5H",
      eventName: "Sign up",
      click: {
        id: "1",
        country: "US",
        city: "San Francisco",
        region: "US-CA",
        continent: "NA",
        ...common,
      },
      link: checkoutLink,
      customer: alex,
    },
    {
      event: "lead",
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      eventId: "YbL8RwLTRRCxQz5H",
      eventName: "Sign up",
      click: {
        id: "1",
        country: "IN",
        city: "Kerala",
        region: "IN-KL",
        continent: "AS",
        ...common,
      },
      link: checkoutLink,
      customer: morgan,
    },
    {
      event: "lead",
      timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
      eventId: "YbL8RwLTRRCxQz5H",
      eventName: "Sign up",
      click: {
        id: "3",
        country: "US",
        city: "Pittsburgh",
        region: "US-PA",
        continent: "NA",
        ...common,
      },
      link: docsLink,
      customer: jordan,
    },
  ],
  sales: [
    {
      event: "sale",
      timestamp: new Date().toISOString(),
      eventId: "Nffk2cwShKu5lQ7E",
      eventName: "Purchase",
      sale: {
        amount: 49_90,
        paymentProcessor: "stripe",
        invoiceId: "123456",
      },
      click: {
        id: "1",
        country: "US",
        city: "San Francisco",
        region: "US-CA",
        continent: "NA",
        ...common,
      },
      link: checkoutLink,
      customer: alex,
    },
    {
      event: "sale",
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      eventId: "Nffk2cwShKu5lQ7E",
      eventName: "Purchase",
      sale: {
        amount: 79_90,
        paymentProcessor: "stripe",
        invoiceId: "123456",
      },
      click: {
        id: "2",
        country: "US",
        city: "Pittsburgh",
        region: "US-PA",
        continent: "NA",
        ...common,
      },
      link: checkoutLink,
      customer: jordan,
    },
    {
      event: "sale",
      timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
      eventId: "Nffk2cwShKu5lQ7E",
      eventName: "Purchase",
      sale: {
        amount: 99_90,
        paymentProcessor: "stripe",
        invoiceId: "123456",
      },
      click: {
        id: "3",
        country: "IN",
        city: "Kerala",
        region: "IN-KL",
        continent: "AS",
        ...common,
      },
      link: checkoutLink,
      customer: morgan,
    },
  ],
};
