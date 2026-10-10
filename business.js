export const languages=['tr','en','de','nl'];
export const partyLabels={
tr:{registryNo:"Sicil no",name:'Ünvan',address:'Adres',country:'Ülke',registrationNo:'Kayıt / vergi no',taxOffice:'Vergi dairesi',contact:'İlgili kişi',phone:'Telefon',email:'E-posta',deliveryAddress:'Teslimat adresi',other:'Ek bilgi',bankName:'Banka',accountName:'Hesap sahibi',branchName:'Şube',accountNo:'Hesap no'},
en:{registryNo:"Company reg. no.",name:'Company / Name',address:'Address',country:'Country',registrationNo:'Registration / Tax no.',taxOffice:'Tax office',contact:'Contact person',phone:'Phone',email:'Email',deliveryAddress:'Delivery address',other:'Additional information',bankName:'Bank',accountName:'Account holder',branchName:'Branch',accountNo:'Account no.'},
de:{registryNo:"Handelsregister-Nr.",name:'Firma / Name',address:'Adresse',country:'Land',registrationNo:'Register- / Steuernr.',taxOffice:'Finanzamt',contact:'Ansprechpartner',phone:'Telefon',email:'E-Mail',deliveryAddress:'Lieferadresse',other:'Zusätzliche Angaben',bankName:'Bank',accountName:'Kontoinhaber',branchName:'Filiale',accountNo:'Kontonummer'},
nl:{registryNo:"Handelsregisternr.",name:'Bedrijfsnaam / Naam',address:'Adres',country:'Land',registrationNo:'Registratie- / Belastingnr.',taxOffice:'Belastingkantoor',contact:'Contactpersoon',phone:'Telefoon',email:'E-mail',deliveryAddress:'Afleveradres',other:'Aanvullende informatie',bankName:'Bank',accountName:'Rekeninghouder',branchName:'Filiaal',accountNo:'Rekeningnummer'}};
const standard={
tr:[
'Üretim ve teslimat, {days} iş günü içerisinde gerçekleştirilecektir.',
'Ön ödeme %70, kalan ödeme ürün bitiminde %30 olarak alınmaktadır.',
'İşin anlaşılan tarihte tamamlanmasının ardından kalan bakiye alıcı tarafından ödenecektir.',
'Dövizli işlemlerde ödeme günü TCMB döviz satış kuru esas alınır.',
'Fiyatlarımıza nakliye ve montaj ile KDV dahil değildir. Talep edildiği takdirde fiyata eklenir.',
'Sipariş bedelinin tamamı tahsil edilmeden ürün sevkiyatı yapılmamaktadır.',
'Termin tarihinden itibaren 10 iş günü içinde teslim alınmayan ürünler için aylık %3 depo ücreti uygulanmaktadır.'],
en:[
'Production and delivery will be completed within {days} working days.',
'A 70% advance payment is required; the remaining 30% is payable upon completion of the product.',
'The buyer shall pay the outstanding balance once the work has been completed on the agreed date.',
'For foreign-currency transactions, the Central Bank of the Republic of Türkiye (TCMB) foreign exchange selling rate on the payment date shall apply.',
'Our prices exclude transport, installation and VAT. These will be added to the price upon request.',
'Products will not be dispatched until the full order amount has been collected.',
'A monthly storage fee of 3% applies to products not collected within 10 working days of the scheduled delivery date.'],
de:[
'Produktion und Lieferung erfolgen innerhalb von {days} Arbeitstagen.',
'Eine Anzahlung von 70% ist erforderlich; die restlichen 30% sind bei Fertigstellung des Produkts zu zahlen.',
'Nach Abschluss der Arbeiten zum vereinbarten Termin ist der Restbetrag vom Käufer zu zahlen.',
'Bei Fremdwährungsgeschäften gilt der Devisenverkaufskurs der Zentralbank der Republik Türkiye (TCMB) am Zahlungstag.',
'Unsere Preise verstehen sich ohne Transport, Montage und Mehrwertsteuer. Diese werden auf Wunsch zum Preis hinzugerechnet.',
'Der Versand erfolgt erst nach vollständigem Zahlungseingang des Auftragsbetrags.',
'Für Produkte, die nicht innerhalb von 10 Arbeitstagen nach dem vorgesehenen Liefertermin abgeholt werden, wird eine monatliche Lagergebühr von 3% erhoben.'],
nl:[
'Productie en levering worden binnen {days} werkdagen uitgevoerd.',
'Een aanbetaling van 70% is vereist; de resterende 30% is verschuldigd zodra het product gereed is.',
'De koper betaalt het resterende saldo nadat het werk op de overeengekomen datum is voltooid.',
'Bij transacties in vreemde valuta geldt de valutaverkoopkoers van de Centrale Bank van de Republiek Türkiye (TCMB) op de betaaldatum.',
'Onze prijzen zijn exclusief transport, montage en btw. Deze worden op verzoek aan de prijs toegevoegd.',
'Producten worden pas verzonden nadat het volledige orderbedrag is ontvangen.',
'Voor producten die niet binnen 10 werkdagen na de geplande leverdatum worden afgehaald, geldt een maandelijkse opslagvergoeding van 3%.']};
export const standardClauses=()=>standard.tr.map((_,i)=>({id:'standard-'+(i+1),texts:Object.fromEntries(languages.map(l=>[l,standard[l][i]]))}));
export const emptyParty=()=>({name:'',address:'',country:'',registrationType:'',registrationNo:'',taxOffice:'',registryNo:'',contact:'',phone:'',email:'',deliveryAddress:'',other:''});
export function migrateParty(raw){const p=emptyParty();const lines=String(raw||'').split('\n').map(x=>x.trim()).filter(Boolean);if(!lines.length)return p;p.name=lines.shift();const patterns=[['address',/^(?:adres|address|adresse)\s*:\s*/i],['phone',/^(?:telefon|telephone|phone|iletişim|ileti[sş]im|tel)\s*:\s*/i],['email',/^(?:e-?posta|e-?mail|mail)\s*:\s*/i],['country',/^(?:ülke|country|land)\s*:\s*/i],['taxOffice',/^(?:vergi dairesi(?: ve no)?|tax office)\s*:\s*/i],['registrationNo',/^(?:CVR[- ]?NR|VAT|VKN|vergi no|tax no)\s*:\s*/i]];for(const line of lines){const found=patterns.find(([,re])=>re.test(line));if(found){p[found[0]]=[p[found[0]],line.replace(found[1],'')].filter(Boolean).join('\n');if(found[0]==='registrationNo')p.registrationType=line.match(/^(CVR|VAT|VKN)/i)?.[1]?.toUpperCase()||''}else if(line.includes('@')&&!p.email)p.email=line;else p.other=[p.other,line].filter(Boolean).join('\n')}return p}
export function migrateClauses(data,fallback){if(Array.isArray(data.clauses))return structuredClone(data.clauses);const base=structuredClone(fallback||standardClauses());if(data.notesText?.trim()){base.push({id:crypto.randomUUID(),texts:{[data.language||'tr']:data.notesText},legacy:true})}return base}
