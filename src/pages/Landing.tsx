import NavBar from "../components/NavBar"
import Hero from "../components/Hero"
import Features from "../components/Features"
import Organization from "../components/Organization"
import Entities from "../components/Entities"

export default function Landing() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />
      <Hero />
      <Features />
      <Organization />
      <Entities />
    </div>
  )
}