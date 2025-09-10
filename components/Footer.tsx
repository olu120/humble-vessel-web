import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-16 text-white bg-brand-dark">
      <Container className="grid gap-8 py-12 md:grid-cols-4">
        <div className="col-span-2">
          <h3 className="text-lg font-semibold">Humble Vessel Foundation & Clinic</h3>
          <p className="mt-2 opacity-80">
            Community-driven healthcare in Bukasa, Wakiso District, Uganda. Accessible care, transparency, and impact.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Get Involved</h4>
          <ul className="space-y-2 opacity-90">
            <li><a href="/donate" className="hover:underline">Donate</a></li>
            <li><a href="/volunteer" className="hover:underline">Volunteer</a></li>
            <li><a href="https://wa.me/XXXXXXXXXX" className="hover:underline">WhatsApp</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Contact</h4>
          <ul className="space-y-2 opacity-90">
            <li>info@humblevesselfoundationandclinic.org</li>
            <li>Bukasa, Wakiso District</li>
          </ul>
        </div>
      </Container>
      <div className="bg-black/20">
        <Container className="flex items-center justify-between py-4 text-sm opacity-80">
          <span>© {new Date().getFullYear()} Humble Vessel</span>
          <span>EN • LG</span>
        </Container>
      </div>
    </footer>
  );
}
