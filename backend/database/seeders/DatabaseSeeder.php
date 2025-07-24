<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\About\Models\About;
use Modules\Documentation\Models\Documentation;
use Modules\Member\Models\Member;
use Modules\Research\Models\Research;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            ['name' => 'Superadmin', 'email' => 'krpaleobrinweb@gmail.com', 'password' => Hash::make('superadmin123'), 'role' => 'superadmin', 'created_at' => now(), 'updated_at' => now(),],
            ['name' => 'Admin', 'email' => 'melanierefman44@gmail.com', 'password' => Hash::make('admin123'), 'role' => 'admin', 'created_at' => now(), 'updated_at' => now(),],
        ]);

        $about = About::first();

        $about = About::create([
            'tentang' => 'Kelompok Riset Iklim dan Lingkungan Masa Lampau berada di bawah Pusat Riset Iklim dan Atmosfer, Organisasi Riset Kebumian dan Maritim, Badan Riset Inovasi Nasional (BRIN). Kami adalah tim peneliti yang fokus pada penelitian variabilitas dan tren perubahan iklim serta lingkungan di masa lalu, dengan menggunakan berbagai data proksi iklim dan arsip alam untuk mengungkap pola perubahan tersebut di berbagai skala spasial dan temporal. Kami bekerja untuk memahami mekanisme perubahan iklim global, serta dampak dari faktor-faktor alami dan antropogenik. Melalui pendekatan interdisipliner yang melibatkan geosfer, atmosfer, dan biosfer, kami bertujuan untuk memberikan wawasan yang lebih dalam tentang bagaimana perubahan iklim dan lingkungan masa lalu mempengaruhi kehidupan di Bumi dan bagaimana hal itu bisa membantu kita memprediksi perubahan yang akan datang.',
            'about' => 'We are the Past Climate and Environmental Change Research Group under the Climate and Atmospheric Research Center of the Earth and Maritime Research Organization, National Research and Innovation Agency (BRIN). Our team is dedicated to understanding the variability and trends in climate and environmental changes in the past, present, and future across various spatial and temporal scales. We aim to comprehend the impacts of natural climate variability and anthropogenic influences on the environment, providing essential insights for scientific communities and policymakers.',
            'fokus_penelitian' => 'Kelompok penelitian ini melakukan penelitian tentang variabilitas dan tren perubahan iklim dan lingkungan di masa lalu pada berbagai skala spasial dan temporal untuk memahami atribusi variabilitas iklim alami dan pengaruh antropogenik. Penelitian ini mencakup analisis dampak perubahan iklim terhadap keanekaragaman hayati, muka air laut, serta korelasinya dengan lingkungan, yang berguna bagi komunitas ilmiah dan pembuat kebijakan untuk memprediksi perubahan di masa depan. Berbagai data proksi seperti karang, sedimen laut, dan pohon digunakan untuk merekonstruksi iklim dan lingkungan, sementara pemodelan dilakukan untuk verifikasi dan kalibrasi, sehingga pemahaman tentang interaksi atmosfer, geosfer, dan biosfer dapat ditingkatkan.',
            'research_focus' => 'This research group conducts research on past climate and environmental change variability and trends at various spatial and temporal scales to understand the attribution of natural climate variability and anthropogenic influences. The research includes analysis of climate change impacts on biodiversity, sea level, and their correlation with the environment, which are useful for the scientific community and policy makers to predict future changes. Various proxy data such as corals, marine sediments, and trees are used to reconstruct climate and environment, while modeling is carried out for verification and calibration, so that the understanding of the interaction of the atmosphere, geosphere, and biosphere can be improved.',
            'tujuan' => 'Misi kami adalah untuk mengungkap kompleksitas perubahan iklim dan lingkungan masa lampau dengan menggunakan berbagai arsip alam dan proksi iklim. Kami berupaya memahami mekanisme yang mendorong perubahan tersebut, dengan fokus pada dampaknya terhadap keanekaragaman hayati, muka laut, dan masyarakat manusia dari waktu ke waktu. Dengan mempelajari data dari berbagai catatan alam seperti terumbu karang, sedimen danau, dan cincin pohon, kami bertujuan untuk merekonstruksi sejarah iklim dari berbagai wilayah dan zaman. Melalui penelitian ini, kami bertujuan memberikan informasi penting kepada komunitas ilmiah dan pembuat kebijakan untuk memprediksi perubahan iklim dan lingkungan di masa depan dengan lebih baik. Komitmen kami adalah menggunakan data historis dan pemodelan iklim untuk menghubungkan masa lalu, sekarang, dan masa depan sistem iklim planet kita. Kami juga fokus pada evaluasi dan penyempurnaan metode yang digunakan untuk merekonstruksi iklim masa lalu guna memastikan bahwa prediksi kami akurat dan dapat diandalkan. Selain itu, penelitian kami sangat penting untuk memahami dampak jangka panjang dari aktivitas manusia terhadap lingkungan serta memberikan masukan tentang strategi mitigasi perubahan iklim di masa depan. Dengan memberikan pemahaman mendalam mengenai hubungan antara tren iklim masa lalu dan masa depan, karya kami mendukung upaya untuk membangun dunia yang lebih berkelanjutan dan tangguh.',
            'purpose' => 'Our mission is to unravel the complexities of past climate and environmental changes by using a variety of natural archives and climate proxies. We seek to understand the mechanisms driving these changes, focusing on how they affect biodiversity, sea levels, and human societies over time. By examining data from diverse natural records such as coral reefs, lake sediments, and tree rings, we aim to reconstruct the climate history of different regions and epochs. Through our research, we aim to provide the scientific community and policymakers with critical information to better predict future climate and environmental changes. Our commitment is to use both historical data and climate modeling to bridge the gap between the past, present, and future of our planet’s climate system. We also focus on evaluating and refining the methods used to reconstruct past climates to ensure that our predictions are as accurate and reliable as possible. Additionally, our research is essential for understanding the long-term impact of human activities on the environment and for advising on future strategies to mitigate climate change. By providing an in-depth understanding of the links between past and future climate trends, our work supports efforts to build a more sustainable and resilient world.',
            'address' => 'Jl. Tamansari No.71, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132, Indonesia',
            'phone' => '081234567890',
            'email' => 'examplebrin@gmail.com',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $imageUrls = [
            'https://images.unsplash.com/photo-1498598457418-36ef20772bb9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmlld3xlbnwwfHwwfHx8MA%3D%3D',
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&auto=format&fit=crop&q=60',
        ];

        foreach ($imageUrls as $url) {
            Documentation::create([
                'about_id' => $about->id,
                'image' => $url,
                'about_type' => 'section2',
                'caption' => 'Lorem ipsum',
                'keterangan' => 'Lorem ipsum',
            ]);
        }

        $expertises = [
            ['keahlian' => 'Studi Antroposen', 'expertise' => 'Anthropocene Studies'],
            ['keahlian' => 'Sedimentologi Karbonat', 'expertise' => 'Carbonate Sedimentology'],
            ['keahlian' => 'Pemodelan Perubahan Iklim', 'expertise' => 'Climate Change Modeling'],
            ['keahlian' => 'Klimatologi', 'expertise' => 'Climatology'],
            ['keahlian' => 'Geomorfologi Pesisir', 'expertise' => 'Coastal Geomorphology'],
            ['keahlian' => 'Paleolimnologi Diatom', 'expertise' => 'Diatom Paleolimnology'],
            ['keahlian' => 'Dendrokronologi', 'expertise' => 'Dendrochronology'],
            ['keahlian' => 'Geologi Lingkungan', 'expertise' => 'Environmental Geology'],
            ['keahlian' => 'Rekonstruksi Lingkungan', 'expertise' => 'Environmental Reconstruction'],
            ['keahlian' => 'Peristiwa Cuaca dan Iklim Ekstrem', 'expertise' => 'Extreme Weather & Climate Events'],
            ['keahlian' => 'Studi Foraminifera', 'expertise' => 'Foraminifera Studies'],
            ['keahlian' => 'Geokronologi', 'expertise' => 'Geochronology'],
            ['keahlian' => 'Geografi', 'expertise' => 'Geography'],
            ['keahlian' => 'Geologi', 'expertise' => 'Geology'],
            ['keahlian' => 'Geomorfologi', 'expertise' => 'Geomorphology'],
            ['keahlian' => 'Hidrogeologi', 'expertise' => 'Hydrogeology'],
            ['keahlian' => 'Geokimia Isotop', 'expertise' => 'Isotope Geochemistry'],
            ['keahlian' => 'Geologi Kelautan', 'expertise' => 'Marine Geology'],
            ['keahlian' => 'Mikroplastik', 'expertise' => 'Microplastic'],
            ['keahlian' => 'Nannofosil', 'expertise' => 'Nannofossil'],
            ['keahlian' => 'Oseanografi', 'expertise' => 'Oceanography'],
            ['keahlian' => 'Oseanografi Sedimen Laut', 'expertise' => 'Oceanography Marine Sediment'],
            ['keahlian' => 'Oseanografi Mikropaleontologi Foraminifera', 'expertise' => 'Oceanography Micropaleontology Foraminifera'],
            ['keahlian' => 'Paleo Tingkat Laut', 'expertise' => 'Paleo Sea Level'],
            ['keahlian' => 'Paleo Lingkungan', 'expertise' => 'Paleoenvironment'],
            ['keahlian' => 'Paleooseanografi', 'expertise' => 'Paleoceanography'],
            ['keahlian' => 'Paleoklimat', 'expertise' => 'Paleoclimate'],
            ['keahlian' => 'Pemodelan Paleoklimat', 'expertise' => 'Paleoclimate Modeling'],
            ['keahlian' => 'Paleoklimatologi', 'expertise' => 'Paleoclimatology'],
            ['keahlian' => 'Palinologi', 'expertise' => 'Palynology'],
            ['keahlian' => 'Analisis Serbuk Sari (Palinologi)', 'expertise' => 'Pollen Analysis'],
            ['keahlian' => 'Geologi Kuarter', 'expertise' => 'Quaternary Geology'],
            ['keahlian' => 'Mikropaleontologi Radiolaria', 'expertise' => 'Radiolarian Micropaleontology'],
            ['keahlian' => 'Perubahan Permukaan Laut', 'expertise' => 'Sea-Level Change'],
            ['keahlian' => 'Sedimentologi', 'expertise' => 'Sedimentology'],
            ['keahlian' => 'Sosiologi', 'expertise' => 'Sociology'],
            ['keahlian' => 'Paleoklimatologi Speleothem', 'expertise' => 'Speleothem Paleoclimatology'],
            ['keahlian' => 'Stratigrafi', 'expertise' => 'Stratigraphy'],
            ['keahlian' => 'Variabilitas Iklim dan Telekoneksi', 'expertise' => 'Teleconnections & Climate Variability']
        ];

        DB::table('members_expertise')->insert($expertises);

        $members = [
            [
                'name' => 'John Doe',
                'role' => 'researcher',
                'is_alumni' => false,
                'is_head' => true,
                'email' => 'john@example.com',
                'phone' => '08123456789',
                'scopus_link' => 'https://www.scopus.com/johndoe',
                'scholar_link' => 'https://scholar.google.com/johndoe',
                'expertise_ids' => [1, 2],
            ],
            [
                'name' => 'Jane Smith',
                'role' => 'postdoc',
                'is_alumni' => false,
                'is_head' => false,
                'email' => 'jane@example.com',
                'phone' => '08987654321',
                'scopus_link' => 'https://www.scopus.com/janesmith',
                'scholar_link' => 'https://scholar.google.com/janesmith',
                'expertise_ids' => [2, 3],
            ],
        ];

        foreach ($members as $entry) {
            $expertiseIds = $entry['expertise_ids'];
            unset($entry['expertise_ids']);

            $member = Member::create($entry);

            if (!empty($expertiseIds)) {
                $member->members_expertise()->attach($expertiseIds);
            }
        }

        $research = Research::create([
            'user_id' => 1,
            'judul' => 'Monitoring Lingkungan dengan IoT',
            'title' => 'Environmental Monitoring using IoT',
            'deskripsi' => 'Penelitian ini memanfaatkan sensor IoT untuk monitoring kualitas lingkungan.',
            'description' => 'This research uses IoT sensors to monitor environmental conditions.',
            'latitude' => -6.20876,
            'longitude' => 106.84513,
            'zoom' => 12,
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-01',
        ]);

        $documentation = Documentation::create([
            'image' => 'https://images.unsplash.com/photo-1597787185613-cf51d79fa7e4?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Vuc29yJTIwaW90fGVufDB8fDB8fHww',
            'keterangan' => 'Pemasangan sensor di lapangan',
            'caption' => 'Sensor dipasang di area kota',
            'type' => 'image',
        ]);

        DB::table('documentation_research')->insert([
            'research_id' => $research->id,
            'documentation_id' => $documentation->id,
            'is_thumbnail' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $coordinatorId = 1;
        $research->members()->attach($coordinatorId, ['is_coor' => true]);

        $memberIds = [2];
        $filtered = array_diff($memberIds, [$coordinatorId]);

        foreach ($filtered as $memberId) {
            $research->members()->attach($memberId, ['is_coor' => false]);
        }
    }
}
