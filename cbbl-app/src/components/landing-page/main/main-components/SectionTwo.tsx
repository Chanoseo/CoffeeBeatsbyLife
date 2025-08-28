import Image from "next/image";

function SectionTwo() {
    return (
        <section className="bg-white p-10 text-center text-brown" id="about">
            <div className="mb-10">
                <h1 className="md:text-5xl text-3xl font-bold mb-3">Our Story</h1>
                <p className="md:text-xl text-base">Where coffee meets rhythm, and every visit finds its flow.</p>
            </div>
            <div className="lg:flex-row flex flex-col-reverse justify-center items-center gap-4">
                <div className="lg:w-2/5 md:text-left w-full flex flex-col gap-4 text-center">
                    <p>At Coffee Beats By Life, we believe coffee is more than a beverage—it&apos;s a rhythm, a ritual, and a refuge.</p>
                    <p>Our journey began with a simple challenge: how do we preserve the serenity of a café while embracing the pulse of a growing community? As demand surged, so did the queues, the crowded tables, and the parking woes. We listened, we learned, and we responded—with a digital-first solution that blends hospitality with smart technology.</p>
                    <p>From real-time reservations and virtual queueing to pre-ordering and parking assistance, every feature of our platform is designed to make your visit smoother, smarter, and more enjoyable.</p>
                    <p>Every tap, every click, every feedback form is part of a bigger beat—one that keeps our café flowing effortlessly and our guests coming back for more.</p>
                    <p>Welcome to a place where life slows down, and every sip is a step in the journey.</p>
                </div>
                <Image src="/cbbl-logo.svg" alt="A beautiful scenery" width={400} height={400} className="md:w-100 md:h-100 w-60 h-60"/>
            </div>
        </section>
    )
}
export default SectionTwo;