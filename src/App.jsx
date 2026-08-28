import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Form, Spinner } from 'react-bootstrap'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Moon, Navigation, Plus, Search, Sun, Trash2, Users } from 'lucide-react'

const defaultCenter = [14.5995, 120.9842]
const fields = [
  { name: 'firstname', label: 'First name', placeholder: 'e.g. Amara', type: 'text' },
  { name: 'lastname', label: 'Last name', placeholder: 'e.g. Santos', type: 'text' },
  { name: 'course', label: 'Course', placeholder: 'e.g. BS Computer Science', type: 'text' },
  { name: 'email', label: 'Email address', placeholder: 'student@university.edu', type: 'email' },
]
const emptyForm = { firstname: '', lastname: '', course: '', email: '', address: '' }
const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

function MapViewport({ selectedStudent }) {
  const map = useMap()
  useEffect(() => {
    if (selectedStudent) map.flyTo([selectedStudent.lat, selectedStudent.lng], 14, { duration: 1 })
  }, [map, selectedStudent])
  return null
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('student-location-theme') === 'dark')
  const [students, setStudents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('student-location-records')) || [] } catch { return [] }
  })
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLocating, setIsLocating] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    localStorage.setItem('student-location-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])
  useEffect(() => localStorage.setItem('student-location-records', JSON.stringify(students)), [students])
  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }) }

  async function registerStudent(event) {
    event.preventDefault(); setStatus({ type: '', message: '' }); setIsLocating(true)
    try {
      const params = new URLSearchParams({ q: form.address, format: 'jsonv2', limit: '1' })
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
      if (!response.ok) throw new Error('The map service is unavailable right now.')
      const results = await response.json()
      if (!results.length) throw new Error('We could not find that address. Try adding a city or country.')
      const result = results[0]
      const student = { ...form, id: crypto.randomUUID(), lat: Number(result.lat), lng: Number(result.lon), locationLabel: result.display_name }
      setStudents((current) => [student, ...current]); setSelectedStudent(student); setForm(emptyForm)
      setStatus({ type: 'success', message: `${student.firstname} ${student.lastname} has been registered.` })
    } catch (error) { setStatus({ type: 'danger', message: error.message }) } finally { setIsLocating(false) }
  }
  function deleteStudent(id) {
    setStudents((current) => current.filter((student) => student.id !== id))
    if (selectedStudent?.id === id) setSelectedStudent(null)
  }

  return <main className={`min-h-screen bg-[#f4f7f6] bg-[radial-gradient(circle_at_90%_0%,rgba(212,107,66,0.11),transparent_25rem)]${isDarkMode ? ' dark' : ''}`}>
    <header className="border-b border-[#dbe5e1] bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 sm:px-8">
      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#166b5a] text-white shadow-[0_8px_18px_rgba(22,107,90,0.2)]"><Navigation size={20} /></div><div><p className="m-0 font-['Space_Grotesk'] text-lg font-bold tracking-tight text-[#173b35]">Campus Compass</p><p className="m-0 text-xs text-[#6a7d78]">Student location registry</p></div></div>
      <div className="flex items-center gap-2"><Button variant="light" aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setIsDarkMode((current) => !current)} className="theme-toggle rounded-lg border border-[#dbe5e1] p-2 text-[#46655c] shadow-sm">{isDarkMode ? <Sun size={17} /> : <Moon size={17} />}</Button><Badge bg="light" className="border border-[#cfe1da] px-3 py-2 text-[#46655c] shadow-sm"><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#36a269] shadow-[0_0_0_3px_#dff2e8]" /> Live registry</Badge></div>
    </div></header>
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 lg:py-12">
      <section className="mb-9 flex flex-col justify-between gap-6 border-b border-[#dbe5e1] pb-8 md:flex-row md:items-end"><div className="max-w-2xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#d46b42]">Location intelligence</p><h1 className="m-0 font-['Space_Grotesk'] text-4xl font-bold leading-[1.05] tracking-tight text-[#173b35] sm:text-5xl">Know where your students are.</h1><p className="mt-4 text-base leading-7 text-[#637670]">Register student information, pinpoint their address, and keep your campus directory in one clear view.</p></div><div className="flex gap-8 md:pb-1"><div><p className="m-0 font-['Space_Grotesk'] text-3xl font-bold text-[#166b5a]">{students.length}</p><p className="m-0 text-xs font-semibold uppercase tracking-wider text-[#72837e]">Located</p></div><div><p className="m-0 font-['Space_Grotesk'] text-3xl font-bold text-[#d46b42]">24/7</p><p className="m-0 text-xs font-semibold uppercase tracking-wider text-[#72837e]">Access</p></div></div></section>
      {status.message && <Alert variant={status.type} dismissible onClose={() => setStatus({ type: '', message: '' })}>{status.message}</Alert>}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="border-0 shadow-[0_16px_45px_rgba(28,65,57,0.1)]"><Card.Body className="p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e7f3ee] text-[#166b5a]"><Plus size={19} /></div><div><h2 className="m-0 font-['Space_Grotesk'] text-xl font-bold text-[#173b35]">Register a student</h2><p className="m-0 text-sm text-[#72837e]">All fields are required</p></div></div>
          <Form onSubmit={registerStudent}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{fields.map((field) => <Form.Group key={field.name}><Form.Label className="mb-1 text-sm font-semibold text-[#3f5b54]">{field.label}</Form.Label><Form.Control required type={field.type} name={field.name} value={form[field.name]} onChange={updateField} placeholder={field.placeholder} className="border-[#dbe5e1] bg-[#fbfdfc] py-2.5 shadow-none focus:border-[#166b5a] focus:ring-2 focus:ring-[#b8ddd1]" /></Form.Group>)}</div>
            <Form.Group className="mt-3"><Form.Label className="mb-1 text-sm font-semibold text-[#3f5b54]">Address</Form.Label><Form.Control required as="textarea" rows={3} name="address" value={form.address} onChange={updateField} placeholder="Street, city, country" className="border-[#dbe5e1] bg-[#fbfdfc] py-2.5 shadow-none focus:border-[#166b5a] focus:ring-2 focus:ring-[#b8ddd1]" /></Form.Group>
            <Button type="submit" disabled={isLocating} className="mt-5 flex w-full items-center justify-center gap-2 border-0 bg-[#166b5a] py-2.5 font-semibold hover:bg-[#105447]">{isLocating ? <><Spinner size="sm" /> Locating address...</> : <><Search size={17} /> Register and locate</>}</Button>
          </Form></Card.Body></Card>
        <Card className="overflow-hidden border-0 shadow-[0_16px_45px_rgba(28,65,57,0.1)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4ece9] bg-white px-5 py-4"><div><div className="flex items-center gap-2"><h2 className="m-0 font-['Space_Grotesk'] text-xl font-bold text-[#173b35]">Student map</h2><span className="rounded bg-[#f7eee9] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#b15c3e]">Live</span></div><p className="m-0 text-sm text-[#72837e]">Click a marker to view student details</p></div><div className="flex items-center gap-2 rounded-full bg-[#e7f3ee] px-3 py-1.5 text-sm font-semibold text-[#166b5a]"><MapPin size={15} /> {students.length} located</div></div><div className="h-[360px] sm:h-[440px]"><MapContainer center={defaultCenter} zoom={12} scrollWheelZoom className="h-full w-full"><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapViewport selectedStudent={selectedStudent} />{students.map((student) => <Marker key={student.id} position={[student.lat, student.lng]} icon={markerIcon} eventHandlers={{ click: () => setSelectedStudent(student) }}><Popup><strong>{student.firstname} {student.lastname}</strong><br />{student.course}<br /><small>{student.address}</small></Popup></Marker>)}</MapContainer></div></Card>
      </div>
      <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#d46b42]">Directory</p><h2 className="m-0 font-['Space_Grotesk'] text-2xl font-bold text-[#173b35]">Registered students</h2></div><div className="flex items-center gap-1.5 text-sm text-[#72837e]"><Users size={16} /> {students.length} total</div></div><Card className="overflow-hidden border-0 shadow-[0_14px_40px_rgba(28,65,57,0.08)]"><div className="overflow-x-auto"><table className="mb-0 w-full min-w-[760px] align-middle"><thead className="bg-[#edf5f2] text-left text-xs uppercase tracking-wider text-[#55736a]"><tr><th className="px-5 py-4">Student</th><th className="px-5 py-4">Course</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Address</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody>{students.length === 0 ? <tr><td colSpan="5" className="px-5 py-12 text-center text-[#7b8d87]"><MapPin className="mx-auto mb-2 text-[#9ab8ae]" size={24} /><p className="m-0 font-semibold text-[#46655c]">No students registered yet</p><p className="m-0 text-sm">Add a student above to start your directory.</p></td></tr> : students.map((student) => <tr key={student.id} className="border-t border-[#e8efed] text-sm"><td className="px-5 py-4"><button className="border-0 bg-transparent p-0 text-left font-semibold text-[#173b35] hover:text-[#166b5a]" onClick={() => setSelectedStudent(student)}>{student.firstname} {student.lastname}</button></td><td className="px-5 py-4 text-[#5f746c]">{student.course}</td><td className="px-5 py-4 text-[#5f746c]">{student.email}</td><td className="max-w-[250px] truncate px-5 py-4 text-[#5f746c]" title={student.locationLabel}>{student.address}</td><td className="px-5 py-4 text-right"><Button variant="link" aria-label={`Delete ${student.firstname} ${student.lastname}`} onClick={() => deleteStudent(student.id)} className="p-1 text-[#c65d4b] hover:text-[#963e31]"><Trash2 size={17} /></Button></td></tr>)}</tbody></table></div></Card></section>
    </div>
  </main>
}

export default App
