import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { InvoiceData, formatRupiah } from "@/lib/constants/invoice";

const styles = StyleSheet.create({
  page: {
    size: "A4",
    orientation: "portrait",
    paddingTop: 45,
    paddingBottom: 50,
    paddingHorizontal: 54,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#000000",
    backgroundColor: "#ffffff",
    lineHeight: 1.4,
  },
  // Header / Kop Surat
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logoWrapper: {
    width: 75,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  logoImage: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },
  logoFallback: {
    width: 55,
    height: 55,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#e11d48",
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#e11d48",
  },
  logoSubtext: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
    textAlign: "center",
  },
  headerTextWrapper: {
    flex: 1,
    textAlign: "center",
    paddingRight: 50, // balances the logo on the left
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  companyAddress: {
    fontSize: 9,
    fontFamily: "Helvetica",
    marginBottom: 2,
  },
  companyContact: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
  },
  headerDivider: {
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    marginBottom: 20,
  },

  // Date top right
  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 10,
    fontFamily: "Helvetica",
  },

  // Metadata Surat (Nomor, Perihal, Lampiran)
  metaContainer: {
    marginBottom: 20,
    flexDirection: "column",
    gap: 3,
  },
  metaRow: {
    flexDirection: "row",
  },
  metaLabel: {
    width: 70,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  metaColon: {
    width: 12,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  metaValue: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Helvetica",
  },

  // Recipient (Yth.)
  recipientContainer: {
    marginBottom: 22,
    flexDirection: "column",
    gap: 2,
  },
  recipientText: {
    fontSize: 10,
    fontFamily: "Helvetica",
  },

  // Salutation & Body
  greetingText: {
    fontSize: 10,
    fontFamily: "Helvetica",
    marginBottom: 10,
  },
  bodyParagraph: {
    fontSize: 10,
    fontFamily: "Helvetica",
    marginBottom: 12,
    textAlign: "justify",
    lineHeight: 1.5,
  },

  // Bank Info Block
  bankBlock: {
    marginTop: 4,
    marginBottom: 16,
    marginLeft: 0,
    flexDirection: "column",
    gap: 3,
  },
  bankRow: {
    flexDirection: "row",
  },
  bankLabel: {
    width: 90,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  bankColon: {
    width: 12,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  bankValue: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Helvetica",
  },

  // Closing
  closingParagraph: {
    fontSize: 10,
    fontFamily: "Helvetica",
    marginBottom: 35,
    textAlign: "justify",
    lineHeight: 1.5,
  },

  // Signature Block
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signatureWrapper: {
    width: 160,
    alignItems: "center",
  },
  signatureSalutation: {
    fontSize: 10,
    fontFamily: "Helvetica",
    marginBottom: 55, // space for signature
  },
  signerName: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
    textAlign: "center",
  },
  signerTitle: {
    fontSize: 10,
    fontFamily: "Helvetica",
    textAlign: "center",
  },
});

interface InvoicePdfDocumentProps {
  data: InvoiceData;
  logoBase64?: string | null;
}

export function InvoicePdfDocument({ data, logoBase64 }: InvoicePdfDocumentProps) {
  const formattedAmount = formatRupiah(data.totalAmount);

  return (
    <Document title={`Surat Tagihan - ${data.letterNumber.replace(/\//g, "-")}`}>
      <Page size="A4" style={styles.page}>
        {/* Header / Kop Surat */}
        <View style={styles.headerContainer}>
          <View style={styles.logoWrapper}>
            {logoBase64 ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={logoBase64} style={styles.logoImage} />
            ) : (
              <View style={styles.logoFallback}>
                <Text style={styles.logoFallbackText}>CA</Text>
              </View>
            )}
            <Text style={styles.logoSubtext}>CV. ALIZA</Text>
          </View>

          <View style={styles.headerTextWrapper}>
            <Text style={styles.companyName}>{data.companyName}</Text>
            <Text style={styles.companyAddress}>{data.companyAddress}</Text>
            <Text style={styles.companyContact}>{data.companyContact}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.headerDivider} />

        {/* Tanggal Surat (Kanan Atas) */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{data.letterDate}</Text>
        </View>

        {/* Nomor, Perihal, Lampiran */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Nomor</Text>
            <Text style={styles.metaColon}>:</Text>
            <Text style={styles.metaValue}>{data.letterNumber}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Perihal</Text>
            <Text style={styles.metaColon}>:</Text>
            <Text style={styles.metaValue}>{data.subject}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Lampiran</Text>
            <Text style={styles.metaColon}>:</Text>
            <Text style={styles.metaValue}>{data.attachment}</Text>
          </View>
        </View>

        {/* Tujuan Surat (Yth.) */}
        <View style={styles.recipientContainer}>
          <Text style={styles.recipientText}>{data.recipientSalutation}</Text>
          {data.recipientTitle ? (
            <Text style={styles.recipientText}>{data.recipientTitle}</Text>
          ) : null}
          <Text style={styles.recipientText}>{data.recipientCompany}</Text>
          <Text style={styles.recipientText}>{data.recipientAddress}</Text>
          <Text style={styles.recipientText}>{data.recipientCity}</Text>
        </View>

        {/* Salam Pembuka */}
        <Text style={styles.greetingText}>{data.greeting}</Text>

        {/* Paragraf 1: Pengantar Layanan & Periode */}
        <Text style={styles.bodyParagraph}>
          Bersama ini kami sampaikan mengenai tagihan {data.serviceDescription}{" "}
          periode {data.periodStart} s/d {data.periodEnd}.
        </Text>

        {/* Paragraf 2: Nilai Tagihan & Terbilang */}
        <Text style={styles.bodyParagraph}>
          Adapun nilai tagihannya sebesar Rp. {formattedAmount}.- ( {data.terbilangAmount} )
        </Text>

        {/* Paragraf 3: Petunjuk Pembayaran */}
        <Text style={styles.bodyParagraph}>
          {data.paymentInstructions}
        </Text>

        {/* Info Rekening */}
        <View style={styles.bankBlock}>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Atas nama</Text>
            <Text style={styles.bankColon}>:</Text>
            <Text style={styles.bankValue}>{data.bankAccountName}</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>No rekening</Text>
            <Text style={styles.bankColon}>:</Text>
            <Text style={styles.bankValue}>{data.bankAccountNumber}</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Bank</Text>
            <Text style={styles.bankColon}>:</Text>
            <Text style={styles.bankValue}>{data.bankName}</Text>
          </View>
        </View>

        {/* Paragraf Penutup */}
        <Text style={styles.closingParagraph}>
          {data.closingText}
        </Text>

        {/* Tanda Tangan */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureWrapper}>
            <Text style={styles.signatureSalutation}>
              {data.signatureSalutation}
            </Text>
            <Text style={styles.signerName}>{data.signerName}</Text>
            <Text style={styles.signerTitle}>{data.signerTitle}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
